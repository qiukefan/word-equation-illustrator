"""Build/package regression tests; outputs are confined to temporary directories."""
import contextlib
import hashlib
import importlib.util
import io
from pathlib import Path
import re
import tempfile
import unittest
from unittest import mock
import xml.etree.ElementTree as ET
import zipfile


REPOSITORY = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('plugin_builder', REPOSITORY / 'build_plugin.py')
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)


class BuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory(prefix='word-equation-build-')
        cls.addClassCleanup(cls.temporary.cleanup)
        cls.version = ET.parse(REPOSITORY / 'src/manifest.xml').getroot().attrib['ExtensionBundleVersion']
        cls.archives = {
            'universal': 'WordEquationIllustrator-' + cls.version + '-universal.zip',
            'windows': 'WordEquationIllustrator-' + cls.version + '-windows.zip',
            'macos': 'WordEquationIllustrator-' + cls.version + '-macos.zip',
        }
        cls.builds = {}
        # Run the actual builder with the same source text checked out under both
        # newline conventions, including the native host and manifest files.
        sources = list((REPOSITORY / 'src').glob('*'))
        sources += list((REPOSITORY / 'upstream').glob('*.html'))
        sources += list((REPOSITORY / 'licenses').glob('*.txt'))
        sources += list((REPOSITORY / 'docs').glob('*.md'))
        for pattern in ('*.py', '*.md', '*.cmd', '*.command'):
            sources += list(REPOSITORY.glob(pattern))
        for label, newline in [('lf', b'\n'), ('crlf', b'\r\n')]:
            root = Path(cls.temporary.name) / ('中文 ' + label)
            for source in sources:
                target = root / source.relative_to(REPOSITORY)
                target.parent.mkdir(parents=True, exist_ok=True)
                data = source.read_bytes().replace(b'\r\n', b'\n')
                target.write_bytes(data.replace(b'\n', newline))
            (root / 'private-test-document.docx').write_bytes(b'Excluded private input')
            output, release = root / 'build' / builder.BUNDLE, root / 'releases'
            with mock.patch.multiple(builder, PLUGIN=root, OUTPUT=output, RELEASE=release):
                with contextlib.redirect_stdout(io.StringIO()):
                    builder.main()
            cls.builds[label] = (output, release)

    def test_build_bytes_and_checksums_do_not_depend_on_checkout_line_endings(self):
        first, second = self.builds['lf'][0], self.builds['crlf'][0]
        for relative in ['index.html', 'CSXS/manifest.xml', 'host/host.jsx', 'SHA256SUMS.txt']:
            with self.subTest(file=relative):
                data = (first / relative).read_bytes()
                self.assertEqual(data, (second / relative).read_bytes())
                self.assertNotIn(b'\r', data)
                data.decode('utf-8')
        for name in self.archives.values():
            with zipfile.ZipFile(self.builds['lf'][1] / name) as first_zip:
                with zipfile.ZipFile(self.builds['crlf'][1] / name) as second_zip:
                    self.assertEqual(first_zip.namelist(), second_zip.namelist())
                    for member in first_zip.namelist():
                        self.assertEqual(first_zip.read(member), second_zip.read(member), member)

    def test_every_distribution_has_valid_payload_and_release_checksums(self):
        for label, (output, release) in self.builds.items():
            manifest = ET.parse(output / 'CSXS/manifest.xml').getroot()
            self.assertEqual(manifest.attrib['ExtensionBundleVersion'], self.version)
            self.assertEqual(manifest.find('./ExtensionList/Extension').attrib['Version'], self.version)
            release_manifest = release / ('SHA256SUMS-' + self.version + '.txt')
            recorded_archives = {}
            for line in release_manifest.read_text(encoding='utf-8').splitlines():
                digest, name = line.split('  ', 1)
                recorded_archives[name] = digest
                self.assertEqual(hashlib.sha256((release / name).read_bytes()).hexdigest(), digest)
            self.assertEqual(set(recorded_archives), set(self.archives.values()))
            for name in self.archives.values():
                with self.subTest(checkout=label, archive=name):
                    with zipfile.ZipFile(release / name) as package:
                        self.assertIsNone(package.testzip())
                        self.assertNotIn('private-test-document.docx', package.namelist())
                        checksums = package.read(builder.BUNDLE + '/SHA256SUMS.txt').decode('utf-8')
                        records = dict(line.split('  ', 1)[::-1] for line in checksums.splitlines())
                        self.assertEqual(set(records), {'index.html', 'CSXS/manifest.xml', 'host/host.jsx'})
                        for member, digest in records.items():
                            data = package.read(builder.BUNDLE + '/' + member)
                            self.assertEqual(hashlib.sha256(data).hexdigest(), digest)
                            self.assertEqual(data, (output / member).read_bytes())

    def test_launchers_and_documentation_are_portable_and_complete(self):
        release = self.builds['crlf'][1]
        for platform, name in self.archives.items():
            with self.subTest(platform=platform), zipfile.ZipFile(release / name) as package:
                names = package.namelist()
                commands = [name for name in names if name.endswith('.command')]
                batches = [name for name in names if name.endswith('.cmd')]
                self.assertEqual(len(commands), 0 if platform == 'windows' else 4)
                self.assertEqual(len(batches), 0 if platform == 'macos' else 4)
                self.assertIn('WINDOWS_INSTALL.md', names)
                for name in commands:
                    info, data = package.getinfo(name), package.read(name)
                    self.assertEqual(info.create_system, 3)
                    self.assertEqual((info.external_attr >> 16) & 0o777, 0o755)
                    self.assertTrue(data.startswith(b'#!/bin/zsh\n'))
                    self.assertNotIn(b'\r', data)
                for name in batches:
                    data = package.read(name)
                    self.assertTrue(data.startswith(b'@echo off\r\n'))
                    self.assertNotIn(b'\n', data.replace(b'\r\n', b''))
                    self.assertNotIn(b'\r', data.replace(b'\r\n', b''))
                    self.assertIn(b'%~dp0install.py', data)
                    data.decode('utf-8')
                for name in ['README.md', '使用说明.md', 'USAGE.en.md', 'WINDOWS_INSTALL.md',
                             'docs/VALIDATION-1.1.0.md', 'THIRD_PARTY_NOTICES.md']:
                    data = package.read(name)
                    self.assertNotIn(b'\r', data)
                    self.assertEqual(data.decode('utf-8'), (REPOSITORY / name).read_text(encoding='utf-8'))
                notices = package.read('THIRD_PARTY_NOTICES.md').decode('utf-8')
                license_links = re.findall(r'\]\((licenses/[^)]+)\)', notices)
                self.assertEqual(len(license_links), 3)
                for name in license_links:
                    self.assertIn(name, names, 'A shipped third-party notice links to an absent license')
                    self.assertEqual(package.read(name).decode('utf-8'), (REPOSITORY / name).read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
