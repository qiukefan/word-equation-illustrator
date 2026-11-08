"""Build an entirely local CEP panel from the existing standalone HTML.

This builds files only. It does not install extensions, change Adobe preferences,
sign packages, or read Word documents.
"""
import hashlib
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

PLUGIN = Path(__file__).resolve().parent
BUNDLE = 'local.word-equation.illustrator'
OUTPUT = PLUGIN / 'build' / BUNDLE
RELEASE = PLUGIN / 'releases'


def main():
    html = (PLUGIN / 'upstream/Word公式转LaTeX.html').read_text(encoding='utf-8')
    policy = ("default-src 'none'; script-src 'self' 'unsafe-inline'; "
              "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
              "font-src data:; connect-src 'none'; object-src 'none'; "
              "frame-src 'none'; base-uri 'none'; form-action 'none'")
    html = html.replace('<head>', '<head>\n<meta http-equiv="Content-Security-Policy" content="' + policy + '">', 1)
    css = (PLUGIN / 'src/panel.css').read_text(encoding='utf-8')
    js = (PLUGIN / 'src/panel.js').read_text(encoding='utf-8').replace('</script', '<\\/script')
    html = html.replace('</head>', '<style>\n' + css + '\n</style>\n</head>', 1)
    # A library may contain literal </body> strings; insert only at the document end.
    before, after = html.rsplit('</body>', 1)
    html = before + '<script>\n' + js + '\n</script>\n</body>' + after
    for folder in [OUTPUT / 'CSXS', OUTPUT / 'host', RELEASE]:
        folder.mkdir(parents=True, exist_ok=True)
    with (OUTPUT / 'index.html').open('w', encoding='utf-8', newline='\n') as stream:
        stream.write(html)
    # Normalize text before checksumming so a Git checkout on another OS still
    # matches the bundled manifest; Windows CRLF must not change these bytes.
    for source, target in [('src/manifest.xml', 'CSXS/manifest.xml'), ('src/host.jsx', 'host/host.jsx')]:
        with (OUTPUT / target).open('w', encoding='utf-8', newline='\n') as stream:
            stream.write((PLUGIN / source).read_text(encoding='utf-8'))
    version = ET.parse(OUTPUT / 'CSXS/manifest.xml').getroot().attrib['ExtensionBundleVersion']
    # The allowlist excludes local documents, tests, source, signing keys and tools.
    members = ['index.html', 'CSXS/manifest.xml', 'host/host.jsx']
    digest = '\n'.join(hashlib.sha256((OUTPUT / member).read_bytes()).hexdigest() + '  ' + member for member in members) + '\n'
    with (OUTPUT / 'SHA256SUMS.txt').open('w', encoding='utf-8', newline='\n') as stream:
        stream.write(digest)
    mac_launchers = ['安装到Illustrator.command', '卸载插件.command', 'Install.command', 'Uninstall.command']
    windows_launchers = ['Install.cmd', 'Uninstall.cmd', '安装到Illustrator.cmd', '卸载插件.cmd']
    common = ['install.py', 'README.md', '使用说明.md', 'USAGE.en.md', 'WINDOWS_INSTALL.md', 'THIRD_PARTY_NOTICES.md',
              'docs/VALIDATION-1.1.0.md',
              'licenses/KATEX-LICENSE.txt', 'licenses/MATHJAX-LICENSE.txt', 'licenses/FFLATE-LICENSE.txt']
    distributions = {
        'WordEquationIllustrator-' + version + '-universal.zip': mac_launchers + windows_launchers,
        'WordEquationIllustrator-' + version + '-windows.zip': windows_launchers,
        'WordEquationIllustrator-' + version + '-macos.zip': mac_launchers,
    }
    for filename, extras in distributions.items():
        archive = RELEASE / filename
        with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as package:
            for member in members + ['SHA256SUMS.txt']:
                package.write(OUTPUT / member, BUNDLE + '/' + member)
            for name in common + extras:
                source = PLUGIN / name
                entry = zipfile.ZipInfo(name)
                entry.create_system = 3
                entry.external_attr = (0o100755 if name.endswith('.command') else 0o100644) << 16
                entry.compress_type = zipfile.ZIP_DEFLATED
                data = source.read_bytes().replace(b'\r\n', b'\n')
                if name.endswith('.cmd'):
                    data = data.replace(b'\n', b'\r\n')
                package.writestr(entry, data)
        print('Local plugin archive:', archive)
    archive_sums = ''.join(hashlib.sha256((RELEASE / name).read_bytes()).hexdigest() + '  ' + name + '\n'
                           for name in distributions)
    with (RELEASE / ('SHA256SUMS-' + version + '.txt')).open('w', encoding='utf-8', newline='\n') as stream:
        stream.write(archive_sums)
    print('CEP panel:', OUTPUT)


if __name__ == '__main__':
    main()
