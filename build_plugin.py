"""Build an entirely local CEP panel from the existing standalone HTML.

This builds files only. It does not install extensions, change Adobe preferences,
sign packages, or read Word documents.
"""
import hashlib
import shutil
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

PLUGIN = Path(__file__).resolve().parent
BUNDLE = 'local.word-equation.illustrator'
OUTPUT = PLUGIN / 'build' / BUNDLE
RELEASE = PLUGIN / 'releases'


def main():
    html = (PLUGIN / 'upstream/Word公式转LaTeX.html').read_text()
    policy = ("default-src 'none'; script-src 'self' 'unsafe-inline'; "
              "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
              "font-src data:; connect-src 'none'; object-src 'none'; "
              "frame-src 'none'; base-uri 'none'; form-action 'none'")
    html = html.replace('<head>', '<head>\n<meta http-equiv="Content-Security-Policy" content="' + policy + '">', 1)
    css = (PLUGIN / 'src/panel.css').read_text()
    js = (PLUGIN / 'src/panel.js').read_text().replace('</script', '<\\/script')
    html = html.replace('</head>', '<style>\n' + css + '\n</style>\n</head>', 1)
    # A library may contain literal </body> strings; insert only at the document end.
    before, after = html.rsplit('</body>', 1)
    html = before + '<script>\n' + js + '\n</script>\n</body>' + after
    for folder in [OUTPUT / 'CSXS', OUTPUT / 'host', RELEASE]:
        folder.mkdir(parents=True, exist_ok=True)
    (OUTPUT / 'index.html').write_text(html)
    shutil.copy2(PLUGIN / 'src/manifest.xml', OUTPUT / 'CSXS/manifest.xml')
    shutil.copy2(PLUGIN / 'src/host.jsx', OUTPUT / 'host/host.jsx')
    ET.parse(OUTPUT / 'CSXS/manifest.xml')
    # The allowlist excludes local documents, tests, source, signing keys and tools.
    members = ['index.html', 'CSXS/manifest.xml', 'host/host.jsx']
    digest = '\n'.join(hashlib.sha256((OUTPUT / member).read_bytes()).hexdigest() + '  ' + member for member in members) + '\n'
    (OUTPUT / 'SHA256SUMS.txt').write_text(digest)
    archive = RELEASE / 'Word公式转LaTeX-Illustrator-1.0.0.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as package:
        for member in members + ['SHA256SUMS.txt']:
            package.write(OUTPUT / member, BUNDLE + '/' + member)
        for filename in ['install.py', '安装到Illustrator.command', '卸载插件.command', 'Install.command', 'Uninstall.command', '使用说明.md', 'USAGE.en.md']:
            source = PLUGIN / filename
            if source.exists():
                package.write(source, filename)
    print('CEP panel:', OUTPUT)
    print('Local plugin archive:', archive)


if __name__ == '__main__':
    main()
