"""Per-user Windows/macOS installer. No network or administrator access required."""
import argparse
import base64
import datetime
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

WINDOWS = sys.platform == 'win32'
if WINDOWS:
    import winreg

ROOT = Path(__file__).resolve().parent
BUNDLE = 'local.word-equation.illustrator'
USER_DATA = (Path(os.environ.get('APPDATA', str(Path.home() / 'AppData/Roaming')))
             if WINDOWS else Path.home() / 'Library/Application Support')
DEST = USER_DATA / 'Adobe/CEP/extensions' / BUNDLE
STATE = USER_DATA / 'WordEquationIllustrator'
DOMAIN = 'com.adobe.CSXS.12'
REGISTRY_KEY = r'Software\Adobe\CSXS.12'
FILES = ['index.html', 'CSXS/manifest.xml', 'host/host.jsx', 'SHA256SUMS.txt']

LANGUAGE = 'zh'
MESSAGES_EN = {
    "Word 公式转 LaTeX · Illustrator 本地安装": "Word → LaTeX · Local Illustrator installer",
    "只复制插件，不修改 Adobe 的加载设置": "Copy the extension without changing Adobe loading preferences",
    "已明确同意：允许 CEP 12 加载未签名本地扩展": "Explicitly consent to allowing CEP 12 to load unsigned local extensions",
    "将本插件移至备份目录": "Move this extension to the backup directory",
    "插件已移至备份：": "Extension moved to backup:",
    "未发现已安装的本插件。": "This extension is not installed.",
    "安装时曾启用 CEP 12 的未签名扩展加载。恢复后，其他未签名 CEP 12 插件也可能无法加载。": "Installation enabled unsigned extension loading for CEP 12. Restoring the original preference may prevent other unsigned CEP 12 extensions from loading.",
    "如需恢复安装前设置，请输入 RESTORE；直接回车保留：": "Type RESTORE to restore the original preference, or press Return to keep it: ",
    "请自行关闭并重新打开 Illustrator，以刷新扩展列表。": "Close and reopen Illustrator when convenient to refresh the extension list.",
    "未找到插件文件夹。请先完整解压安装包。": "Extension folder not found. Fully extract the installation package first.",
    "插件文件夹不能是符号链接。请重新解压安装包。": "The extension folder cannot be a symbolic link. Extract the package again.",
    "插件文件缺失或包含符号链接：": "An extension file is missing or is a symbolic link: ",
    "插件文件清单无效。": "The extension checksum manifest is invalid.",
    "插件文件清单不完整。请重新解压安装包。": "The extension checksum manifest is incomplete. Extract the package again.",
    "插件文件校验失败，请重新解压安装包：": "Extension file verification failed. Extract the package again: ",
    "这是为本机制作的未签名 CEP 插件。Adobe 默认不加载未签名扩展。": "This is an unsigned local CEP extension. Adobe does not load unsigned extensions by default.",
    "继续会把 com.adobe.CSXS.12 的 PlayerDebugMode 设为 1。": "Continuing sets PlayerDebugMode to 1 in com.adobe.CSXS.12.",
    "继续会把 HKCU\\Software\\Adobe\\CSXS.12 的 PlayerDebugMode 设为字符串 1。": "Continuing sets PlayerDebugMode to the string 1 in HKCU\\Software\\Adobe\\CSXS.12.",
    "此设置允许本机所有 CEP 12 宿主加载未签名扩展，并非只允许这个插件。": "This preference lets all CEP 12 hosts on this computer load unsigned extensions, not only this extension.",
    "不会更改 macOS Gatekeeper，不需要管理员权限，不安装 Rosetta，也不上传文件。": "No macOS Gatekeeper changes, administrator privileges, Rosetta installation, or file uploads are involved.",
    "仅修改当前 Windows 用户的配置；不需要管理员权限，也不上传文件。": "Only the current Windows user's configuration is changed; no administrator privileges or file uploads are involved.",
    "需要 Python 3.9 或更高版本。": "Python 3.9 or later is required.",
    "安装程序仅支持 Windows 和 macOS。": "This installer supports Windows and macOS only.",
    "仅与 --uninstall 一起使用：恢复安装前的 Adobe 加载设置": "Use with --uninstall only: restore the original Adobe loading preference",
    "--restore-preference 必须与 --uninstall 一起使用。": "--restore-preference requires --uninstall.",
    "Adobe 加载设置已恢复。": "The original Adobe loading preference has been restored.",
    "Adobe 加载设置在安装后已更改；保留当前设置和原值备份。": "The Adobe loading preference changed after installation; the current preference and original backup were preserved.",
    "明确同意此设置并安装，请输入 ENABLE；直接回车取消：": "Type ENABLE to consent to this preference and install, or press Return to cancel: ",
    "已取消，未修改任何设置或安装文件。": "Cancelled. No preferences or installation files were changed.",
    "Adobe 加载设置未能自动恢复；原值仍保存在：": "The Adobe loading preference could not be restored automatically. Its original value remains saved in:",
    "插件文件已安装：": "Extension files installed:",
    "仅复制文件；Adobe 仍会阻止此未签名插件加载。": "Files were copied only. Adobe will still prevent this unsigned extension from loading.",
    "保存自己的工作后，关闭并重新打开 Illustrator。": "Save your work, then close and reopen Illustrator.",
    "从「窗口 → 扩展 → Word → LaTeX」打开面板。": "Open the panel from Window → Extensions → Word → LaTeX."
}


def tr(message):
    return MESSAGES_EN.get(message, message) if LANGUAGE == 'en' else message


def set_preference(value):
    if WINDOWS:
        if value is None:
            try:
                with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REGISTRY_KEY, 0, winreg.KEY_SET_VALUE) as key:
                    winreg.DeleteValue(key, 'PlayerDebugMode')
            except FileNotFoundError:
                pass
            return
        if isinstance(value, dict):
            value_type = value['type']
            data = value['value']
            if isinstance(data, dict):
                data = base64.b64decode(data['base64'], validate=True)
        else:
            value_type, data = winreg.REG_SZ, str(value)
        with winreg.CreateKeyEx(winreg.HKEY_CURRENT_USER, REGISTRY_KEY, 0, winreg.KEY_SET_VALUE) as key:
            winreg.SetValueEx(key, 'PlayerDebugMode', 0, value_type, data)
        return
    if value is None:
        subprocess.run(['/usr/bin/defaults', 'delete', DOMAIN, 'PlayerDebugMode'], check=True)
    else:
        subprocess.run(['/usr/bin/defaults', 'write', DOMAIN, 'PlayerDebugMode', '-string', str(value)], check=True)


def preference():
    if WINDOWS:
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REGISTRY_KEY, 0, winreg.KEY_READ) as key:
                value, value_type = winreg.QueryValueEx(key, 'PlayerDebugMode')
        except FileNotFoundError:
            return None
        if isinstance(value, bytes):
            value = {'base64': base64.b64encode(value).decode('ascii')}
        return {'value': value, 'type': value_type}
    result = subprocess.run(['/usr/bin/defaults', 'read', DOMAIN, 'PlayerDebugMode'], capture_output=True, text=True, encoding='utf-8')
    return result.stdout.strip() if result.returncode == 0 else None


def preference_enabled(value):
    # CEP documents this setting as a string, not a DWORD.
    return value == ({'value': '1', 'type': winreg.REG_SZ} if WINDOWS else '1')


def write_state(path, value):
    """Replace state atomically so a failed write cannot truncate its backup."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent,
                                         prefix='install-state-', suffix='.tmp', delete=False) as stream:
            temporary = Path(stream.name)
            json.dump(value, stream, ensure_ascii=False, indent=2)
            stream.write('\n')
        temporary.replace(path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def backup(path):
    folder = STATE / 'Backups' / datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    folder.mkdir(parents=True)
    target = folder / BUNDLE
    shutil.move(str(path), str(target))
    return target


def main():
    global LANGUAGE
    language_parser = argparse.ArgumentParser(add_help=False)
    language_parser.add_argument('--language', choices=['zh', 'en'], default='zh')
    language_args, _ = language_parser.parse_known_args()
    LANGUAGE = language_args.language
    if sys.version_info < (3, 9):
        raise SystemExit(tr('需要 Python 3.9 或更高版本。'))
    if sys.platform not in ('darwin', 'win32'):
        raise SystemExit(tr('安装程序仅支持 Windows 和 macOS。'))
    parser = argparse.ArgumentParser(description=tr('Word 公式转 LaTeX · Illustrator 本地安装'))
    parser.add_argument('--language', choices=['zh', 'en'], default='zh', help='界面语言 / Interface language')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--copy-only', action='store_true', help=tr('只复制插件，不修改 Adobe 的加载设置'))
    mode.add_argument('--enable-unsigned', action='store_true', help=tr('已明确同意：允许 CEP 12 加载未签名本地扩展'))
    mode.add_argument('--uninstall', action='store_true', help=tr('将本插件移至备份目录'))
    parser.add_argument('--restore-preference', action='store_true', help=tr('仅与 --uninstall 一起使用：恢复安装前的 Adobe 加载设置'))
    args = parser.parse_args()
    if args.restore_preference and not args.uninstall:
        parser.error(tr('--restore-preference 必须与 --uninstall 一起使用。'))
    state_file = STATE / 'install-state.json'
    previous = json.loads(state_file.read_text(encoding='utf-8')) if state_file.exists() else {}
    if args.uninstall:
        if DEST.exists() or DEST.is_symlink():
            print(tr('插件已移至备份：'), backup(DEST))
        else:
            print(tr('未发现已安装的本插件。'))
        if previous.get('enabled_by_installer') and preference_enabled(preference()):
            print(tr('安装时曾启用 CEP 12 的未签名扩展加载。恢复后，其他未签名 CEP 12 插件也可能无法加载。'))
            if args.restore_preference or input(tr('如需恢复安装前设置，请输入 RESTORE；直接回车保留：')).strip() == 'RESTORE':
                original = previous.get('original_debug_mode')
                set_preference(original)
                previous['enabled_by_installer'] = False
                write_state(state_file, previous)
                print(tr('Adobe 加载设置已恢复。'))
        elif previous.get('enabled_by_installer'):
            print(tr('Adobe 加载设置在安装后已更改；保留当前设置和原值备份。'))
        print(tr('请自行关闭并重新打开 Illustrator，以刷新扩展列表。'))
        return

    source = ROOT / BUNDLE
    if not source.is_dir():
        source = ROOT / 'build' / BUNDLE
    if not source.is_dir():
        raise SystemExit(tr('未找到插件文件夹。请先完整解压安装包。'))
    if source.is_symlink():
        raise SystemExit(tr('插件文件夹不能是符号链接。请重新解压安装包。'))
    for name in FILES:
        path = source / name
        if not path.is_file() or any(part.is_symlink() for part in [path, *path.parents] if part != source and source in part.parents):
            raise SystemExit(tr('插件文件缺失或包含符号链接：') + name)
    checksums = {}
    for line in (source / 'SHA256SUMS.txt').read_text(encoding='utf-8').splitlines():
        fields = line.split('  ', 1)
        if len(fields) != 2:
            raise SystemExit(tr('插件文件清单无效。'))
        expected, name = fields
        if name not in FILES[:-1] or name in checksums or len(expected) != 64 or any(c not in '0123456789abcdef' for c in expected):
            raise SystemExit(tr('插件文件清单无效。'))
        checksums[name] = expected
    if set(checksums) != set(FILES[:-1]):
        raise SystemExit(tr('插件文件清单不完整。请重新解压安装包。'))
    for name, expected in checksums.items():
        if hashlib.sha256((source / name).read_bytes()).hexdigest() != expected:
            raise SystemExit(tr('插件文件校验失败，请重新解压安装包：') + name)
    enabled = preference_enabled(preference())
    enable_after_copy = False
    if not enabled and not args.copy_only:
        print(tr('这是为本机制作的未签名 CEP 插件。Adobe 默认不加载未签名扩展。'))
        print(tr('继续会把 HKCU\\Software\\Adobe\\CSXS.12 的 PlayerDebugMode 设为字符串 1。' if WINDOWS
                 else '继续会把 com.adobe.CSXS.12 的 PlayerDebugMode 设为 1。'))
        print(tr('此设置允许本机所有 CEP 12 宿主加载未签名扩展，并非只允许这个插件。'))
        print(tr('仅修改当前 Windows 用户的配置；不需要管理员权限，也不上传文件。' if WINDOWS
                 else '不会更改 macOS Gatekeeper，不需要管理员权限，不安装 Rosetta，也不上传文件。'))
        if not args.enable_unsigned and input(tr('明确同意此设置并安装，请输入 ENABLE；直接回车取消：')).strip() != 'ENABLE':
            print(tr('已取消，未修改任何设置或安装文件。'))
            return
        enable_after_copy = True
    DEST.parent.mkdir(parents=True, exist_ok=True)
    original_preference = None
    preference_attempted = False
    state_attempted = False
    state_before = state_file.read_bytes() if state_file.exists() else None
    old = backup(DEST) if DEST.exists() or DEST.is_symlink() else None
    try:
        for name in FILES:
            target = DEST / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source / name, target)
        # Finish copying before changing Adobe's signature-check preference.
        # Remember the original value before the write so failures can roll back.
        if enable_after_copy:
            STATE.mkdir(parents=True, exist_ok=True)
            original_preference = preference()
            next_state = dict(previous)
            if not previous.get('enabled_by_installer'):
                next_state['original_debug_mode'] = original_preference
            next_state['enabled_by_installer'] = True
            state_attempted = True
            write_state(state_file, next_state)
            preference_attempted = True
            set_preference('1')
            enabled = True
    except Exception:
        preference_restored = True
        try:
            if preference_attempted and preference() != original_preference:
                set_preference(original_preference)
        except Exception:
            preference_restored = False
            print(tr('Adobe 加载设置未能自动恢复；原值仍保存在：'), state_file)
        if state_attempted and preference_restored:
            if state_before is None:
                state_file.unlink(missing_ok=True)
            else:
                state_file.write_bytes(state_before)
        if DEST.exists():
            backup(DEST)
        if old:
            shutil.move(str(old), str(DEST))
        raise
    print(tr('插件文件已安装：'), DEST)
    if not enabled:
        print(tr('仅复制文件；Adobe 仍会阻止此未签名插件加载。'))
    print(tr('保存自己的工作后，关闭并重新打开 Illustrator。'))
    print(tr('从「窗口 → 扩展 → Word → LaTeX」打开面板。'))


if __name__ == '__main__':
    main()
