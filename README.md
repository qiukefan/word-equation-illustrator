# Word 公式转 LaTeX · Illustrator 离线插件 / Offline Illustrator Extension

[简体中文](#中文) · [English](#english)

<a id="中文"></a>
## 简体中文

在 Adobe Illustrator 中粘贴 Word 公式、编辑 LaTeX、预览数学排版，并把公式插入当前画板。转换与渲染均在本机完成，不上传 Word 文档或公式。

适用于 **macOS · Illustrator 2026（30.x）· CEP 12**。这是未签名的 CEP 开发版扩展，未发布到 Adobe Marketplace。独立浏览器版本：[word-equation-latex](https://github.com/qiukefan/word-equation-latex)。

### 功能

- 从 Word 复制原生公式，或本地导入 `.docx` 提取公式。
- 选择 11 种内置数学字体样式、4–96 pt 字号和十六进制颜色。
- 实时预览，导出 PNG、SVG、`.tex` 和 `.md`。
- 通过 macOS 原生保存对话框导出文件。
- 将公式作为可编辑矢量路径组，居中插入当前画板的新“公式”图层。
- 排版库和字体内置，支持完全离线使用。

### 安装与环境

需要 macOS、Illustrator 2026（30.x，CEP 12）以及 Python 3.9 或更新版本。安装器和源码构建均需要 Python；安装命令使用系统路径 `/usr/bin/python3`，已在 Python 3.9.6 环境验证。

1. 下载 [完整安装包](releases/Word公式转LaTeX-Illustrator-1.0.0.zip) 并完整解压。
2. 双击 `安装到Illustrator.command`。
3. 阅读安装器提示。未启用本地扩展加载时，输入 `ENABLE` 才会安装并把 CEP 12 的 `PlayerDebugMode` 设为 `1`；直接回车取消。
4. 保存工作并重启 Illustrator。
5. 打开 **窗口 → 扩展功能 → Word 公式转 LaTeX**。

这个加载设置适用于所有 CEP 12 宿主，允许它们加载未签名扩展。安装器不会改动 Gatekeeper，不需要管理员权限，也不会关闭 Illustrator。若保留 Adobe 默认验签设置，可暂不安装此开发版。

插件安装到 `~/Library/Application Support/Adobe/CEP/extensions/local.word-equation.illustrator`。已存在的同名插件会先移至 `~/Library/Application Support/WordEquationIllustrator/Backups`。完整说明见 [使用说明](使用说明.md)。

### 使用

1. 在 Illustrator 中新建或打开文档，激活目标画板。
2. 在面板输入框用 `⌘V` 粘贴 Word 公式，导入 `.docx`，或直接编辑 LaTeX。
3. 选择字体、字号和颜色，检查预览。
4. 点击“插入当前画板”。若生成期间切换了文档或画板，插入会取消。
5. 需要独立文件时，使用 PNG、SVG、`.tex` 或 `.md` 导出按钮。

预览缩放只影响查看，不改变导出或插入的字号比例。若 CEP 不支持“读取剪贴板”按钮，请直接在输入框粘贴。

### 限制

- 插入后的公式是矢量路径，不是文本，不依赖系统字体。分组备注保留 LaTeX 和样式，但当前版本尚不支持选中已插入公式后回读编辑。
- 图片公式、扫描件及旧版嵌入对象不能直接识别。
- 花体和手写体主要覆盖大写拉丁字母，其他字符保留数学字形。
- 已在 Illustrator 30.5.1 中进行插入测试；其他版本尚未进行同等实机验证。首次 SVG 导入可能较慢，请等待插入完成。

### 卸载与设置恢复

双击 `卸载插件.command`。卸载器会把本插件移至备份目录，不删除其他插件。

如果安装器此前启用了未签名扩展加载，卸载时会单独询问是否恢复原设置。只有输入 `RESTORE` 才恢复，直接回车保留。恢复设置可能影响其他未签名 CEP 12 插件。完成后保存工作并重启 Illustrator。

### 从源码构建

构建只需要 Python 3.9 或更新版本，不使用网络，也不安装任何软件包。在仓库根目录运行：

```sh
python3 build_plugin.py
```

生成：

- `build/local.word-equation.illustrator/`：CEP 面板文件及 SHA-256 清单。
- `releases/Word公式转LaTeX-Illustrator-1.0.0.zip`：包含本地安装器的完整安装包。

`src/` 保存 Illustrator 面板适配代码、ExtendScript 插入代码和扩展清单。`upstream/Word公式转LaTeX.html` 是独立 HTML 应用的固定快照，内含转换器、排版引擎和字体，因此本仓库可以单独离线构建。更新转换器时，用 [独立 HTML 项目](https://github.com/qiukefan/word-equation-latex) 构建的新文件替换此快照，再运行构建命令。

### 开发验证

可用 Python 启动仅监听本机的临时静态服务器：

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8766/tests/panel.html` 可运行 7 项面板集成检查。测试采用合成公式和模拟的 Illustrator / 保存对话框，不读取用户文档或剪贴板，不执行真实插入或保存。`tests/preview.html` 可查看面板布局。该服务器仅用于开发验证，插件运行不需要它。

插入代码曾在 Illustrator 30.5.1 中验证：生成 159 × 45 pt 的矢量公式，画板居中，无栅格图、链接图或字体文本。

### 隐私与离线

扩展内置排版库、公式字形和字体，不依赖账户、联网服务或 Node.js。扩展页面通过内容安全策略禁止网络连接和远程资源。Word 文档在本机内存中解析；插入公式时的 SVG 临时文件在导入后删除。插件不保存或关闭已有文档。

仓库不包含个人 Word 文档、实机测试作品、签名证书或机器配置。

### 许可证

KaTeX、MathJax 和 fflate 的版本与许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，完整第三方许可保留于 `licenses/` 并同时嵌入 HTML。此仓库未为原创项目代码指定额外开源许可证。

[English ↓](#english)

---

<a id="english"></a>
## English

Paste Word equations, edit LaTeX, preview mathematical typesetting, and insert equations into the active artboard in Adobe Illustrator. Conversion and rendering run locally; Word documents and equations are not uploaded.

Designed for **macOS · Illustrator 2026 (30.x) · CEP 12**. This is an unsigned CEP development extension and is not published on Adobe Marketplace. Standalone browser edition: [word-equation-latex](https://github.com/qiukefan/word-equation-latex).

### Features

- Paste native Word equations or extract equations from a locally imported `.docx` file.
- Choose from 11 bundled mathematical font styles, sizes from 4 to 96 pt, and hexadecimal colors.
- Preview equations live and export PNG, SVG, `.tex`, and `.md` files.
- Save exports using native macOS file dialogs.
- Insert each equation as an editable vector path group, centered on the active artboard in a new layer named “公式”.
- Use the extension entirely offline, with typesetting libraries and fonts included.

### Requirements and installation

You need macOS, Illustrator 2026 (30.x, CEP 12), and Python 3.9 or later. Both the installer and source build require Python. The installer command uses `/usr/bin/python3` and has been verified with Python 3.9.6.

1. Download and fully extract the [complete installation package](releases/Word公式转LaTeX-Illustrator-1.0.0.zip).
2. Double-click `安装到Illustrator.command`.
3. Read the installer prompts. If unsigned extension loading is not already enabled, type `ENABLE` to install and set CEP 12's `PlayerDebugMode` to `1`. Pressing Return without entering `ENABLE` cancels installation.
4. Save your work and restart Illustrator.
5. Open **Window → Extensions → Word 公式转 LaTeX**.

This loading preference applies to all CEP 12 hosts and allows them to load unsigned extensions. The installer does not change Gatekeeper, require administrator privileges, or close Illustrator. If you wish to retain Adobe's default signature verification settings, do not install this development build yet.

The extension is installed at `~/Library/Application Support/Adobe/CEP/extensions/local.word-equation.illustrator`. An existing extension with the same identifier is moved to `~/Library/Application Support/WordEquationIllustrator/Backups` first. Further details are available in the [Chinese usage guide](使用说明.md).

### Usage

1. Create or open an Illustrator document and activate the target artboard.
2. Paste a Word equation into the panel with `⌘V`, import a `.docx` file, or edit LaTeX directly.
3. Select the font style, size, and color, then check the preview.
4. Click “插入当前画板” (Insert into active artboard). Insertion is cancelled if the active document or artboard changes while the equation is being generated.
5. Use the PNG, SVG, `.tex`, or `.md` export buttons when you need a separate file.

Preview zoom changes only the viewing scale; it does not change the size used for export or insertion. If CEP does not support the clipboard-reading button, paste directly into the input area.

### Limitations

- Inserted equations are vector paths rather than text and do not depend on installed system fonts. The group note retains the LaTeX and style settings, but this version cannot reload a selected equation for further editing.
- Equation images, scans, and legacy embedded equation objects cannot be recognized directly.
- Calligraphic and script styles mainly cover uppercase Latin letters; other characters retain mathematical glyphs.
- Insertion has been tested in Illustrator 30.5.1. Other versions have not received equivalent testing in the application. The first SVG import can be slow; wait for insertion to finish.

### Uninstallation and preference restoration

Double-click `卸载插件.command`. The uninstaller moves this extension to the backup directory and does not remove other extensions.

If the installer previously enabled unsigned extension loading, the uninstaller separately asks whether to restore the original preference. Type `RESTORE` to restore it, or press Return to keep the current setting. Restoring this preference may affect other unsigned CEP 12 extensions. Save your work and restart Illustrator afterward.

### Build from source

Building requires only Python 3.9 or later. It does not use the network or install any packages. From the repository root, run:

```sh
python3 build_plugin.py
```

Outputs:

- `build/local.word-equation.illustrator/`: CEP panel files and a SHA-256 manifest.
- `releases/Word公式转LaTeX-Illustrator-1.0.0.zip`: the complete package, including the local installer.

`src/` contains the Illustrator panel adapter, ExtendScript insertion code, and extension manifest. `upstream/Word公式转LaTeX.html` is a fixed snapshot of the standalone HTML application, including its converter, typesetting engines, and fonts, so this repository builds independently and offline. To update the converter, replace this snapshot with a newly built file from the [standalone HTML project](https://github.com/qiukefan/word-equation-latex), then run the build command again.

### Development checks

Start a temporary static server that listens only on the local computer:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766/tests/panel.html` to run seven panel integration checks. These tests use synthetic equations and simulated Illustrator and file-dialog interfaces. They do not read user documents or the clipboard, and they do not perform real insertion or file saving. Open `tests/preview.html` to inspect the panel layout. This server is only for development checks; the extension does not require it to run.

The insertion code was also tested in Illustrator 30.5.1: it produced a centered 159 × 45 pt vector equation with no raster images, linked images, or font-based text.

### Privacy and offline operation

Typesetting libraries, equation glyphs, and fonts are bundled with the extension. It does not depend on an account, an online service, or Node.js. The panel's Content Security Policy blocks network connections and remote resources. Word documents are parsed in local memory. Temporary SVG files used for insertion are deleted after import. The extension does not save or close existing documents.

This repository does not include personal Word documents, artwork from tests in Illustrator, signing certificates, or machine configuration files.

### Licensing

Versions and licenses for KaTeX, MathJax, and fflate are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Full third-party license texts are retained in `licenses/` and embedded in the HTML bundles. No additional open-source license has been assigned to this project's original code.

[返回简体中文 / Back to Chinese](#中文)
