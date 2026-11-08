# Word 公式转 LaTeX · Illustrator 离线插件 / Offline Illustrator Extension

[简体中文](#中文) · [English](#english)

<a id="中文"></a>
## 简体中文

在 Adobe Illustrator 中粘贴 Word 公式、编辑 LaTeX、预览数学排版，并把公式插入当前画板。转换与渲染均在本机完成，不上传 Word 文档或公式。

适用于 **Windows / macOS · Illustrator 2025–2026（29.5.1–30.x）· CEP 12**。这是未签名的 CEP 开发版扩展，未发布到 Adobe Marketplace。独立浏览器版本：[word-equation-latex](https://github.com/qiukefan/word-equation-latex)。

### 功能

- 右上角「中文 / English」随时切换界面语言，保留当前公式与样式。

- 从 Word 复制原生公式，或本地导入 `.docx` 提取公式。
- 选择 11 种内置数学字体样式、4–96 pt 字号和十六进制颜色。
- 实时预览，导出 PNG、SVG、`.tex` 和 `.md`。
- 通过 Windows / macOS 原生保存对话框导出文件。
- 将公式作为可编辑矢量路径组，居中插入当前画板的新“公式”图层（英文界面为“Equation”）。
- 排版库和字体内置，支持完全离线使用。

### 安装与环境

需要 Windows 或 macOS、Illustrator 2025–2026（29.5.1–30.x，CEP 12）以及 Python 3.9 或更新版本。安装器和源码构建均需要 Python；插件运行不需要 Python。

1. 下载 v1.1.0 的 [Windows 安装包](https://github.com/qiukefan/word-equation-illustrator/releases/download/v1.1.0/WordEquationIllustrator-1.1.0-windows.zip) 或 [macOS 安装包](https://github.com/qiukefan/word-equation-illustrator/releases/download/v1.1.0/WordEquationIllustrator-1.1.0-macos.zip)，并完整解压。各版本安装包保存在 [GitHub Releases](https://github.com/qiukefan/word-equation-illustrator/releases)；[最新版本](https://github.com/qiukefan/word-equation-illustrator/releases/latest) 提供当前下载。
2. **Windows：**双击 `安装到Illustrator.cmd`（英文入口为 `Install.cmd`）；**macOS：**双击 `安装到Illustrator.command`（英文入口为 `Install.command`）。不要直接从 ZIP 预览窗口运行安装器。
3. 阅读安装器提示。未启用本地扩展加载时，输入 `ENABLE` 才会安装并把 CEP 12 的 `PlayerDebugMode` 设为 `1`；直接回车取消。
4. 保存工作并重启 Illustrator。
5. 打开 **窗口 → 扩展功能 → Word → LaTeX**。

Windows 安装器自动查找 Python 3.9+；未找到时会显示安装提示。macOS 安装入口使用 `/usr/bin/python3`，已在 Python 3.9.6 环境验证。Windows 详细步骤与故障排查见 [Windows 安装指南](WINDOWS_INSTALL.md)。

这个加载设置适用于当前用户的 CEP 12 宿主，允许它们加载未签名扩展。Windows 使用 `HKCU\Software\Adobe\CSXS.12` 下的 `REG_SZ` 值 `PlayerDebugMode=1`；macOS 使用 `com.adobe.CSXS.12` 偏好设置。安装无需管理员权限，不会关闭 Illustrator，也不改动 macOS Gatekeeper。

| 系统 | 插件目录 | 备份目录 |
| --- | --- | --- |
| Windows | `%APPDATA%\Adobe\CEP\extensions\local.word-equation.illustrator` | `%APPDATA%\WordEquationIllustrator\Backups` |
| macOS | `~/Library/Application Support/Adobe/CEP/extensions/local.word-equation.illustrator` | `~/Library/Application Support/WordEquationIllustrator/Backups` |

重复安装会先备份同名插件。完整说明见 [使用说明](使用说明.md)。

### 使用

面板右上角选择 **中文** 或 **English** 即可切换；无需重新导入或转换公式。切换过程完全在本机完成，不会上传文档内容。

1. 在 Illustrator 中新建或打开文档，激活目标画板。
2. 在面板输入框用 `Ctrl+V`（Windows）或 `⌘V`（macOS）粘贴 Word 公式，导入 `.docx`，或直接编辑 LaTeX。
3. 选择字体、字号和颜色，检查预览。
4. 点击“插入当前画板”。若生成期间切换了文档或画板，插入会取消。
5. 需要独立文件时，使用 PNG、SVG、`.tex` 或 `.md` 导出按钮。

预览缩放只影响查看，不改变导出或插入的字号比例。若 CEP 不支持“读取剪贴板”按钮，请直接在输入框粘贴。

### 限制

- 插入后的公式是矢量路径，不是文本，不依赖系统字体。分组备注保留 LaTeX 和样式，但当前版本尚不支持选中已插入公式后回读编辑。
- 图片公式、扫描件及旧版嵌入对象不能直接识别。
- 花体和手写体主要覆盖大写拉丁字母，其他字符保留数学字形。
- Windows Illustrator 29.6.1 已完成安装、面板加载和原生插入验证；macOS Illustrator 30.5.1 有此前的插入验证记录。具体测试范围见下方“开发验证”。首次 SVG 导入可能较慢，请等待插入完成。

### 卸载与设置恢复

Windows 双击 `卸载插件.cmd`（或 `Uninstall.cmd`）；macOS 双击 `卸载插件.command`（或 `Uninstall.command`）。卸载器会把本插件移至备份目录，不删除其他插件。

如果安装器此前启用了未签名扩展加载，卸载时会单独询问是否恢复原设置。只有输入 `RESTORE` 才恢复，直接回车保留。Windows 会恢复安装前的注册表值及其类型；原先不存在的值会被移除。恢复设置可能影响其他未签名 CEP 12 插件。完成后保存工作并重启 Illustrator。

### 从源码构建

构建只需要 Python 3.9 或更新版本，不使用网络，也不安装任何软件包。在仓库根目录运行：

```sh
python3 build_plugin.py
```

Windows 可运行 `py -3 build_plugin.py`；未安装 Python 启动器时，使用指向 Python 3.9+ 的 `python build_plugin.py`。

生成：

- `build/local.word-equation.illustrator/`：CEP 面板文件及 SHA-256 清单。
- `releases/WordEquationIllustrator-1.1.0-windows.zip`：Windows 安装包。
- `releases/WordEquationIllustrator-1.1.0-macos.zip`：macOS 安装包。
- `releases/Word公式转LaTeX-Illustrator-1.1.0.zip`：包含两种系统安装入口的通用安装包。

`src/` 保存 Illustrator 面板适配代码、ExtendScript 插入代码和扩展清单。`upstream/Word公式转LaTeX.html` 是独立 HTML 应用的固定快照，内含转换器、排版引擎和字体，因此本仓库可以单独离线构建。更新转换器时，用 [独立 HTML 项目](https://github.com/qiukefan/word-equation-latex) 构建的新文件替换此快照，再运行构建命令。

### 开发验证

可用 Python 启动仅监听本机的临时静态服务器：

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8766/tests/panel.html` 可运行 11 项面板集成检查。测试采用合成公式和模拟的 Illustrator / 保存对话框，不读取用户文档或剪贴板，不执行真实插入或保存。`tests/preview.html` 可查看面板布局。该服务器仅用于开发验证，插件运行不需要它。

v1.1.0 已在 Windows 11（build 22631）、Python 3.14.4、Illustrator 29.6.1 / CEP 12.1 上，从解压后的 Windows 安装包成功安装，并实际打开扩展菜单和面板。另通过 Illustrator COM 调用已安装的 `host.jsx`，导入面板生成的真实 SVG，得到 159 × 45 pt、含 27 条路径及公式元数据的矢量组，无文本、栅格图或链接图。此次验证覆盖了真实面板加载和原生插入，但未完成面板“插入当前画板”按钮的端到端点击测试。

16 项安装器测试分别在 Python 3.12 / 3.14 通过，11 项面板检查分别在 Win32 / MacIntel 模拟环境通过，另有 3 项安装包检查通过。macOS Illustrator 30.5.1 的插入记录来自此前测试，本次未重新进行 macOS 实机验证。详见 [v1.1.0 验证记录](docs/VALIDATION-1.1.0.md)。

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

Designed for **Windows / macOS · Illustrator 2025–2026 (29.5.1–30.x) · CEP 12**. This is an unsigned CEP development extension and is not published on Adobe Marketplace. Standalone browser edition: [word-equation-latex](https://github.com/qiukefan/word-equation-latex).

### Features

- Switch between Chinese and English using the top-right language selector without losing the current equation or style settings.

- Paste native Word equations or extract equations from a locally imported `.docx` file.
- Choose from 11 bundled mathematical font styles, sizes from 4 to 96 pt, and hexadecimal colors.
- Preview equations live and export PNG, SVG, `.tex`, and `.md` files.
- Save exports using native Windows / macOS file dialogs.
- Insert each equation as an editable vector path group, centered on the active artboard in a new layer named “Equation” (“公式” in Chinese).
- Use the extension entirely offline, with typesetting libraries and fonts included.

### Requirements and installation

You need Windows or macOS, Illustrator 2025–2026 (29.5.1–30.x, CEP 12), and Python 3.9 or later. Both installation and source builds require Python; running the extension does not.

1. Download and fully extract the v1.1.0 [Windows package](https://github.com/qiukefan/word-equation-illustrator/releases/download/v1.1.0/WordEquationIllustrator-1.1.0-windows.zip) or [macOS package](https://github.com/qiukefan/word-equation-illustrator/releases/download/v1.1.0/WordEquationIllustrator-1.1.0-macos.zip). Versioned installers are available in [GitHub Releases](https://github.com/qiukefan/word-equation-illustrator/releases); use [the latest release](https://github.com/qiukefan/word-equation-illustrator/releases/latest) for the current version.
2. **Windows:** double-click `Install.cmd`. **macOS:** double-click `Install.command`. Do not run the installer inside the ZIP preview.
3. Read the installer prompts. If unsigned extension loading is not already enabled, type `ENABLE` to install and set CEP 12's `PlayerDebugMode` to `1`. Pressing Return without entering `ENABLE` cancels installation.
4. Save your work and restart Illustrator.
5. Open **Window → Extensions → Word → LaTeX**.

The Windows launcher automatically looks for Python 3.9+ and explains how to install it if missing. The macOS launcher uses `/usr/bin/python3` and has been verified with Python 3.9.6. See the [English usage guide](USAGE.en.md) for Windows troubleshooting.

This preference allows the current user's CEP 12 hosts to load unsigned extensions. Windows uses the `REG_SZ` value `PlayerDebugMode=1` under `HKCU\Software\Adobe\CSXS.12`; macOS uses the `com.adobe.CSXS.12` preference. Installation requires no administrator privileges, does not close Illustrator, and does not change macOS Gatekeeper.

| System | Extension directory | Backup directory |
| --- | --- | --- |
| Windows | `%APPDATA%\Adobe\CEP\extensions\local.word-equation.illustrator` | `%APPDATA%\WordEquationIllustrator\Backups` |
| macOS | `~/Library/Application Support/Adobe/CEP/extensions/local.word-equation.illustrator` | `~/Library/Application Support/WordEquationIllustrator/Backups` |

Reinstalling first backs up an existing extension with the same identifier.

### Usage

Choose **English** from the language selector in the top-right corner of the panel. The selector also lets you switch back to **中文**.

1. Create or open an Illustrator document and activate the target artboard.
2. Paste a Word equation into the panel with `Ctrl+V` on Windows or `⌘V` on macOS, import a `.docx` file, or edit LaTeX directly.
3. Select the font style, size, and color, then check the preview.
4. Click “Insert into artboard”. Insertion is cancelled if the active document or artboard changes while the equation is being generated.
5. Use the PNG, SVG, `.tex`, or `.md` export buttons when you need a separate file.

Preview zoom changes only the viewing scale; it does not change the size used for export or insertion. If CEP does not support the clipboard-reading button, paste directly into the input area.

### Limitations

- Inserted equations are vector paths rather than text and do not depend on installed system fonts. The group note retains the LaTeX and style settings, but this version cannot reload a selected equation for further editing.
- Equation images, scans, and legacy embedded equation objects cannot be recognized directly.
- Calligraphic and script styles mainly cover uppercase Latin letters; other characters retain mathematical glyphs.
- Installation, panel loading, and native insertion were verified in Illustrator 29.6.1 on Windows. Earlier insertion testing covered Illustrator 30.5.1 on macOS. See “Development checks” below for the scope. The first SVG import can be slow; wait for insertion to finish.

### Uninstallation and preference restoration

On Windows, double-click `Uninstall.cmd`; on macOS, double-click `Uninstall.command`. The uninstaller moves this extension to the backup directory and does not remove other extensions.

If the installer previously enabled unsigned extension loading, the uninstaller separately asks whether to restore the original preference. Type `RESTORE` to restore it, or press Return to keep the current setting. Windows restores the original registry value and type, or removes the value if it did not previously exist. Restoring this preference may affect other unsigned CEP 12 extensions. Save your work and restart Illustrator afterward.

### Build from source

Building requires only Python 3.9 or later. It does not use the network or install any packages. From the repository root, run:

```sh
python3 build_plugin.py
```

On Windows, run `py -3 build_plugin.py`, or `python build_plugin.py` if the Python launcher is unavailable and `python` points to Python 3.9+.

Outputs:

- `build/local.word-equation.illustrator/`: CEP panel files and a SHA-256 manifest.
- `releases/WordEquationIllustrator-1.1.0-windows.zip`: Windows installation package.
- `releases/WordEquationIllustrator-1.1.0-macos.zip`: macOS installation package.
- `releases/Word公式转LaTeX-Illustrator-1.1.0.zip`: universal package with launchers for both systems.

`src/` contains the Illustrator panel adapter, ExtendScript insertion code, and extension manifest. `upstream/Word公式转LaTeX.html` is a fixed snapshot of the standalone HTML application, including its converter, typesetting engines, and fonts, so this repository builds independently and offline. To update the converter, replace this snapshot with a newly built file from the [standalone HTML project](https://github.com/qiukefan/word-equation-latex), then run the build command again.

### Development checks

Start a temporary static server that listens only on the local computer:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766/tests/panel.html` to run 11 panel integration checks. These tests use synthetic equations and simulated Illustrator and file-dialog interfaces. They do not read user documents or the clipboard, and they do not perform real insertion or file saving. Open `tests/preview.html` to inspect the panel layout. This server is only for development checks; the extension does not require it to run.

For v1.1.0, installation from the extracted Windows package succeeded on Windows 11 (build 22631), Python 3.14.4, and Illustrator 29.6.1 / CEP 12.1. The extension menu and panel were opened in Illustrator. Separately, Illustrator COM invoked the installed `host.jsx` with an actual SVG generated by the panel, producing a 159 × 45 pt group with 27 paths and equation metadata, with no text, raster images, or linked images. This verifies panel loading and native insertion; it does not constitute an end-to-end click test of the panel’s insertion button.

All 16 installer tests passed under Python 3.12 and 3.14, all 11 panel checks passed under simulated Win32 and MacIntel platforms, and three package checks passed. The Illustrator 30.5.1 macOS insertion result is from earlier testing; macOS was not retested in the application for this release. See the [v1.1.0 validation record](docs/VALIDATION-1.1.0.md).

### Privacy and offline operation

Typesetting libraries, equation glyphs, and fonts are bundled with the extension. It does not depend on an account, an online service, or Node.js. The panel's Content Security Policy blocks network connections and remote resources. Word documents are parsed in local memory. Temporary SVG files used for insertion are deleted after import. The extension does not save or close existing documents.

This repository does not include personal Word documents, artwork from tests in Illustrator, signing certificates, or machine configuration files.

### Licensing

Versions and licenses for KaTeX, MathJax, and fflate are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Full third-party license texts are retained in `licenses/` and embedded in the HTML bundles. No additional open-source license has been assigned to this project's original code.

[返回简体中文 / Back to Chinese](#中文)
