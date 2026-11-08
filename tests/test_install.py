"""Installer regression tests: temporary files and an in-memory Windows registry only.

Run with: python -m unittest discover -s tests -p "test_*.py" -v
"""
import contextlib
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock


SPEC = importlib.util.spec_from_file_location('installer', Path(__file__).resolve().parents[1] / 'install.py')
installer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(installer)


class FakeRegistry:
    HKEY_CURRENT_USER = object()
    KEY_READ, KEY_SET_VALUE = 1, 2
    REG_SZ, REG_BINARY, REG_DWORD, REG_MULTI_SZ = 1, 3, 4, 7

    def __init__(self, value=None):
        self.value = value  # (data, type), or absent
        self.writes = []
        self.fail_writes = 0

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def OpenKey(self, hive, name, reserved, access):
        assert hive is self.HKEY_CURRENT_USER
        assert name == r'Software\Adobe\CSXS.12'
        if self.value is None:
            raise FileNotFoundError(name)
        return self

    def CreateKeyEx(self, hive, name, reserved, access):
        assert hive is self.HKEY_CURRENT_USER
        assert name == r'Software\Adobe\CSXS.12'
        return self

    def QueryValueEx(self, key, name):
        assert name == 'PlayerDebugMode'
        if self.value is None:
            raise FileNotFoundError(name)
        return self.value

    def SetValueEx(self, key, name, reserved, value_type, value):
        assert name == 'PlayerDebugMode'
        self.value = (value, value_type)
        self.writes.append(self.value)
        if self.fail_writes:
            self.fail_writes -= 1
            raise OSError('Simulated registry write failure after partial success')

    def DeleteValue(self, key, name):
        assert name == 'PlayerDebugMode'
        self.value = None
        self.writes.append(None)


class InstallerTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='word-equation-test-')
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / '包含中文'
        self.source = self.root / installer.BUNDLE
        for name in installer.FILES[:-1]:
            target = self.source / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text('Test fixture: ' + name + '\n中文\n', encoding='utf-8')
        manifest = '\n'.join(
            hashlib.sha256((self.source / name).read_bytes()).hexdigest() + '  ' + name
            for name in installer.FILES[:-1]
        ) + '\n'
        (self.source / 'SHA256SUMS.txt').write_text(manifest, encoding='utf-8')
        self.dest = self.root / 'appdata/Adobe/CEP/extensions' / installer.BUNDLE
        self.state = self.root / 'appdata/WordEquationIllustrator'
        self.state_file = self.state / 'install-state.json'
        self.registry = FakeRegistry()
        self.patches = contextlib.ExitStack()
        self.addCleanup(self.patches.close)
        for name, value in [('ROOT', self.root), ('DEST', self.dest), ('STATE', self.state),
                            ('WINDOWS', True), ('winreg', self.registry)]:
            self.patches.enter_context(mock.patch.object(installer, name, value, create=True))
        self.patches.enter_context(mock.patch.object(installer.sys, 'platform', 'win32'))

    def run_installer(self, *args, response=''):
        output = io.StringIO()
        with mock.patch.object(installer.sys, 'argv', ['install.py', '--language', 'en', *args]), \
                mock.patch('builtins.input', return_value=response), contextlib.redirect_stdout(output):
            installer.main()
        return output.getvalue()

    def read_state(self):
        return json.loads(self.state_file.read_text(encoding='utf-8'))

    def make_old_install(self):
        self.dest.mkdir(parents=True)
        (self.dest / 'old.txt').write_text('Previous installation', encoding='utf-8')

    def assert_old_install_restored(self):
        self.assertEqual((self.dest / 'old.txt').read_text(encoding='utf-8'), 'Previous installation')
        self.assertFalse((self.dest / 'index.html').exists())

    def test_install_uses_string_registry_value_and_records_absence(self):
        self.run_installer('--enable-unsigned')
        self.assertEqual(self.registry.value, ('1', FakeRegistry.REG_SZ))
        self.assertEqual(self.read_state(), {'enabled_by_installer': True, 'original_debug_mode': None})
        for name in installer.FILES:
            self.assertEqual((self.dest / name).read_bytes(), (self.source / name).read_bytes())

    def test_reinstall_preserves_initial_registry_backup(self):
        self.registry.value = (0, FakeRegistry.REG_DWORD)
        self.run_installer('--enable-unsigned')
        first_state = self.state_file.read_bytes()
        self.run_installer('--enable-unsigned')
        self.assertEqual(self.state_file.read_bytes(), first_state)
        self.assertEqual(len(self.registry.writes), 1)
        self.assertEqual(self.read_state()['original_debug_mode'], {'value': 0, 'type': FakeRegistry.REG_DWORD})
        self.assertEqual(len(list((self.state / 'Backups').glob('*/' + installer.BUNDLE))), 1)

    def test_copy_only_never_changes_registry_or_creates_state(self):
        self.registry.value = (b'\x00\xff', FakeRegistry.REG_BINARY)
        self.run_installer('--copy-only')
        self.assertEqual(self.registry.value, (b'\x00\xff', FakeRegistry.REG_BINARY))
        self.assertEqual(self.registry.writes, [])
        self.assertFalse(self.state_file.exists())
        self.assertTrue((self.dest / 'index.html').is_file())

    def test_bad_hash_leaves_existing_install_and_registry_untouched(self):
        self.make_old_install()
        (self.source / 'index.html').write_text('Modified', encoding='utf-8')
        with self.assertRaisesRegex(SystemExit, 'verification failed'):
            self.run_installer('--enable-unsigned')
        self.assert_old_install_restored()
        self.assertEqual(self.registry.writes, [])
        self.assertFalse(self.state.exists())

    def test_incomplete_hash_manifest_is_rejected_before_installation(self):
        manifest = self.source / 'SHA256SUMS.txt'
        manifest.write_text(manifest.read_text(encoding='utf-8').splitlines()[0] + '\n', encoding='utf-8')
        with self.assertRaisesRegex(SystemExit, 'incomplete'):
            self.run_installer('--enable-unsigned')
        self.assertFalse(self.dest.exists())
        self.assertEqual(self.registry.writes, [])

    def test_unsigned_consent_can_be_cancelled_without_side_effects(self):
        self.run_installer(response='')
        self.assertFalse(self.dest.exists())
        self.assertFalse(self.state.exists())
        self.assertEqual(self.registry.writes, [])

    def test_existing_enabled_setting_is_not_claimed_by_installer(self):
        self.registry.value = ('1', FakeRegistry.REG_SZ)
        self.run_installer()
        self.assertEqual(self.registry.writes, [])
        self.assertFalse(self.state_file.exists())

    def test_uninstall_restores_original_value_and_type(self):
        originals = [None, (0, FakeRegistry.REG_DWORD), ('custom', FakeRegistry.REG_SZ),
                     (b'\x00\xff', FakeRegistry.REG_BINARY), (['a', '中文'], FakeRegistry.REG_MULTI_SZ)]
        for original in originals:
            with self.subTest(original=original):
                self.registry.value = original
                self.run_installer('--enable-unsigned')
                self.run_installer('--uninstall', '--restore-preference')
                self.assertEqual(self.registry.value, original)
                self.assertFalse(self.dest.exists())
                self.assertFalse(self.read_state()['enabled_by_installer'])

    def test_interactive_uninstall_can_restore(self):
        self.registry.value = (5, FakeRegistry.REG_DWORD)
        self.run_installer('--enable-unsigned')
        self.run_installer('--uninstall', response='RESTORE')
        self.assertEqual(self.registry.value, (5, FakeRegistry.REG_DWORD))

    def test_uninstall_can_keep_setting_and_restore_later(self):
        self.run_installer('--enable-unsigned')
        self.run_installer('--uninstall', response='')
        self.assertEqual(self.registry.value, ('1', FakeRegistry.REG_SZ))
        self.assertTrue(self.read_state()['enabled_by_installer'])
        self.run_installer('--uninstall', '--restore-preference')
        self.assertIsNone(self.registry.value)
        self.assertFalse(self.read_state()['enabled_by_installer'])

    def test_uninstall_does_not_overwrite_subsequent_user_setting(self):
        self.run_installer('--enable-unsigned')
        self.registry.value = ('changed', FakeRegistry.REG_SZ)
        self.run_installer('--uninstall', '--restore-preference')
        self.assertEqual(self.registry.value, ('changed', FakeRegistry.REG_SZ))
        self.assertTrue(self.read_state()['enabled_by_installer'])

    def test_copy_failure_rolls_back_previous_install(self):
        self.make_old_install()
        actual_copy = installer.shutil.copy2

        def fail_second_file(source, target):
            if str(source).endswith('manifest.xml'):
                raise OSError('Simulated copy failure')
            return actual_copy(source, target)

        with mock.patch.object(installer.shutil, 'copy2', side_effect=fail_second_file):
            with self.assertRaisesRegex(OSError, 'copy failure'):
                self.run_installer('--enable-unsigned')
        self.assert_old_install_restored()
        self.assertEqual(self.registry.writes, [])
        self.assertFalse(self.state_file.exists())

    def test_failed_registry_write_restores_original_type_and_files(self):
        self.make_old_install()
        original = (b'\x00\xff', FakeRegistry.REG_BINARY)
        self.registry.value = original
        self.registry.fail_writes = 1
        with self.assertRaisesRegex(OSError, 'registry write failure'):
            self.run_installer('--enable-unsigned')
        self.assertEqual(self.registry.value, original)
        self.assert_old_install_restored()
        self.assertFalse(self.state_file.exists())

    def test_failed_state_write_does_not_change_registry(self):
        self.make_old_install()
        with mock.patch.object(installer, 'write_state', side_effect=OSError('State write failed')):
            with self.assertRaisesRegex(OSError, 'State write failed'):
                self.run_installer('--enable-unsigned')
        self.assert_old_install_restored()
        self.assertEqual(self.registry.writes, [])
        self.assertFalse(self.state_file.exists())

    def test_rollback_retains_original_backup_if_registry_restore_fails(self):
        self.make_old_install()
        self.registry.value = (4, FakeRegistry.REG_DWORD)
        self.registry.fail_writes = 2
        with self.assertRaisesRegex(OSError, 'registry write failure'):
            self.run_installer('--enable-unsigned')
        self.assert_old_install_restored()
        self.assertEqual(self.read_state()['original_debug_mode'], {'value': 4, 'type': FakeRegistry.REG_DWORD})

    def test_macos_defaults_behavior_is_preserved(self):
        with mock.patch.object(installer, 'WINDOWS', False), \
                mock.patch.object(installer.subprocess, 'run') as run:
            run.return_value = subprocess.CompletedProcess([], 0, stdout='1\n')
            self.assertEqual(installer.preference(), '1')
            self.assertTrue(installer.preference_enabled('1'))
            installer.set_preference('1')
            run.assert_called_with(['/usr/bin/defaults', 'write', 'com.adobe.CSXS.12',
                                    'PlayerDebugMode', '-string', '1'], check=True)
            installer.set_preference(None)
            run.assert_called_with(['/usr/bin/defaults', 'delete', 'com.adobe.CSXS.12',
                                    'PlayerDebugMode'], check=True)


if __name__ == '__main__':
    unittest.main()
