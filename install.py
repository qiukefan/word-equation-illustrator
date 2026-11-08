"""Local macOS installer. No network, sudo, application restart, or Gatekeeper changes."""
import argparse
import datetime
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BUNDLE = 'local.word-equation.illustrator'
DEST = Path.home() / 'Library/Application Support/Adobe/CEP/extensions' / BUNDLE
STATE = Path.home() / 'Library/Application Support/WordEquationIllustrator'
DOMAIN = 'com.adobe.CSXS.12'
FILES = ['index.html', 'CSXS/manifest.xml', 'host/host.jsx', 'SHA256SUMS.txt']


def set_preference(value):
    if value is None:
        subprocess.run(['/usr/bin/defaults', 'delete', DOMAIN, 'PlayerDebugMode'], check=True)
    else:
        subprocess.run(['/usr/bin/defaults', 'write', DOMAIN, 'PlayerDebugMode', '-string', str(value)], check=True)


def preference():
    result = subprocess.run(['/usr/bin/defaults', 'read', DOMAIN, 'PlayerDebugMode'], capture_output=True, text=True)
    return result.stdout.strip() if result.returncode == 0 else None


def backup(path):
    folder = STATE / 'Backups' / datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    folder.mkdir(parents=True)
    target = folder / BUNDLE
    shutil.move(str(path), str(target))
    return target


def main():
    parser = argparse.ArgumentParser(description='Word 公式转 LaTeX · Illustrator 本地安装')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--copy-only', action='store_true', help='只复制插件，不修改 Adobe 的加载设置')
    mode.add_argument('--enable-unsigned', action='store_true', help='已明确同意：允许 CEP 12 加载未签名本地扩展')
    mode.add_argument('--uninstall', action='store_true', help='将本插件移至备份目录')
    args = parser.parse_args()
    state_file = STATE / 'install-state.json'
    previous = json.loads(state_file.read_text()) if state_file.exists() else {}
    if args.uninstall:
        if DEST.exists() or DEST.is_symlink():
            print('插件已移至备份：', backup(DEST))
        else:
            print('未发现已安装的本插件。')
        if previous.get('enabled_by_installer') and preference() == '1':
            print('安装时曾启用 CEP 12 的未签名扩展加载。恢复后，其他未签名 CEP 12 插件也可能无法加载。')
            if input('如需恢复安装前设置，请输入 RESTORE；直接回车保留：').strip() == 'RESTORE':
                original = previous.get('original_debug_mode')
                set_preference(original)
                previous['enabled_by_installer'] = False
                state_file.write_text(json.dumps(previous, ensure_ascii=False, indent=2))
        print('请自行关闭并重新打开 Illustrator，以刷新扩展列表。')
        return

    source = ROOT / BUNDLE
    if not source.is_dir():
        source = ROOT / 'build' / BUNDLE
    if not source.is_dir():
        raise SystemExit('未找到插件文件夹。请先完整解压安装包。')
    if source.is_symlink():
        raise SystemExit('插件文件夹不能是符号链接。请重新解压安装包。')
    for name in FILES:
        path = source / name
        if not path.is_file() or any(part.is_symlink() for part in [path, *path.parents] if part != source and source in part.parents):
            raise SystemExit('插件文件缺失或包含符号链接：' + name)
    checksums = {}
    for line in (source / 'SHA256SUMS.txt').read_text().splitlines():
        fields = line.split('  ', 1)
        if len(fields) != 2:
            raise SystemExit('插件文件清单无效。')
        expected, name = fields
        if name not in FILES[:-1] or name in checksums or len(expected) != 64 or any(c not in '0123456789abcdef' for c in expected):
            raise SystemExit('插件文件清单无效。')
        checksums[name] = expected
    if set(checksums) != set(FILES[:-1]):
        raise SystemExit('插件文件清单不完整。请重新解压安装包。')
    for name, expected in checksums.items():
        if hashlib.sha256((source / name).read_bytes()).hexdigest() != expected:
            raise SystemExit('插件文件校验失败，请重新解压安装包：' + name)
    enabled = preference() == '1'
    enable_after_copy = False
    if not enabled and not args.copy_only:
        print('这是为本机制作的未签名 CEP 插件。Adobe 默认不加载未签名扩展。')
        print('继续会把 com.adobe.CSXS.12 的 PlayerDebugMode 设为 1。')
        print('此设置允许本机所有 CEP 12 宿主加载未签名扩展，并非只允许这个插件。')
        print('不会更改 macOS Gatekeeper，不需要管理员权限，不安装 Rosetta，也不上传文件。')
        if not args.enable_unsigned and input('明确同意此设置并安装，请输入 ENABLE；直接回车取消：').strip() != 'ENABLE':
            print('已取消，未修改任何设置或安装文件。')
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
            state_file.write_text(json.dumps(next_state, ensure_ascii=False, indent=2))
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
            print('Adobe 加载设置未能自动恢复；原值仍保存在：', state_file)
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
    print('插件文件已安装：', DEST)
    if not enabled:
        print('仅复制文件；Adobe 仍会阻止此未签名插件加载。')
    print('保存自己的工作后，关闭并重新打开 Illustrator。')
    print('从「窗口 → 扩展 → Word 公式转 LaTeX」打开面板。')


if __name__ == '__main__':
    main()
