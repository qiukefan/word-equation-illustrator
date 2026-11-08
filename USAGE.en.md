# Word → LaTeX · Offline Illustrator Extension

[简体中文](使用说明.md)

For Illustrator 2025–2026 on Windows or macOS (29.5.1–30.x, CEP 12). This is an unsigned CEP development extension and is not published on Adobe Marketplace.

## Features

- Switch between **中文** and **English** using the language selector in the top-right corner. The current equation, font, size, and color are preserved.
- Paste native Word equations, or import a local `.docx` file to extract equations.
- Edit LaTeX and choose from 11 mathematical font styles, sizes from 4 to 96 pt, and hexadecimal colors.
- Export PNG, SVG, `.tex`, and `.md` files through native Windows / macOS save dialogs.
- Click **Insert into artboard** to place an editable vector group at the center of the active Illustrator artboard.
- Each insertion creates an **Equation** layer (**公式** when the interface is Chinese). The chosen physical font size is preserved; preview zoom does not change insertion size.

Inserted equations are vector paths, so they do not require installed fonts. The group note retains the LaTeX and style settings. This version cannot reload a selected equation for editing. Calligraphic and script styles mainly cover uppercase Latin letters; other characters retain their mathematical glyphs.

## Install

Installation and source builds require Python 3.9 or later; running the extension does not. Windows launchers try `py -3`, then `python`, and check the version. macOS launchers use `/usr/bin/python3`.

1. Get the package for your system from [GitHub Releases](https://github.com/qiukefan/word-equation-illustrator/releases/latest): `WordEquationIllustrator-1.1.0-windows.zip` or `WordEquationIllustrator-1.1.0-macos.zip`. The universal `Word公式转LaTeX-Illustrator-1.1.0.zip` includes both systems. Fully extract the package; do not run the installer inside the ZIP preview.
2. **Windows:** double-click `Install.cmd` for English prompts, or `安装到Illustrator.cmd` for Chinese. **macOS:** use `Install.command` or `安装到Illustrator.command`.
3. Adobe does not load unsigned CEP extensions by default. If needed, the installer explains the CEP 12 `PlayerDebugMode = 1` preference and requires you to type `ENABLE` before continuing. Press Return to cancel without changing settings or installation files. This preference allows **all CEP 12 hosts for the current user** to load unsigned extensions.
4. Save your work, then close and reopen Illustrator yourself.
5. Open **Window → Extensions → Word → LaTeX**.
6. Choose **English** in the panel’s top-right language selector.

No administrator privileges are required. The installer does not close Illustrator, change macOS Gatekeeper, install Rosetta, or upload files.

| Item | Windows | macOS |
| --- | --- | --- |
| Extension directory | `%APPDATA%\Adobe\CEP\extensions\local.word-equation.illustrator` | `~/Library/Application Support/Adobe/CEP/extensions/local.word-equation.illustrator` |
| State and backup root | `%APPDATA%\WordEquationIllustrator` | `~/Library/Application Support/WordEquationIllustrator` |
| Loading preference | `REG_SZ` value `PlayerDebugMode=1` under `HKCU\Software\Adobe\CSXS.12` | `PlayerDebugMode=1` in `com.adobe.CSXS.12` |

Reinstall using the same launcher. The existing extension is moved to `Backups` under the state directory before the new files are installed. The original loading preference is retained for restoration during uninstallation.

To retain Adobe’s default signature verification, do not install this development build yet. A signed ZXP can be created later in an environment with Adobe’s `ZXPSignCmd`; this repository contains no signing certificates or tools.

For command-line installation with English prompts:

```sh
python3 install.py --language en
```

On Windows, run `py -3 install.py --language en` from the extracted package directory. If `py` is unavailable, use `python` pointing to Python 3.9 or later.

## Windows troubleshooting

- **Python is missing or too old:** install Python 3.9+ from [python.org](https://www.python.org/downloads/windows/), with the Python launcher or Python available on `PATH`. Open a new terminal and check `py -3 --version` or `python --version`, then run `Install.cmd` again. A Microsoft Store shortcut without an installed interpreter is insufficient.
- **Extension files cannot be found or verified:** extract the complete ZIP into a normal folder and retry. Keep `install.py` and the `local.word-equation.illustrator` folder together. For a source checkout, run `py -3 build_plugin.py` before installation.
- **The panel does not appear:** save your work and fully restart Illustrator. Check that Illustrator is 29.5.1 or later in the 29.x series, or 30.x and that you installed under the same Windows account used to run Illustrator. Re-run the installer to verify the files and loading preference. Run `reg query HKCU\Software\Adobe\CSXS.12 /v PlayerDebugMode` to inspect the current setting without modifying it; successful unsigned loading requires `REG_SZ` value `1`.
- **A launcher closes or shows an error:** open PowerShell in the extracted package directory and run `py -3 install.py --language en` to retain the error output. There is no need to run as administrator.
- **Pasting does not work through the button:** click the equation input area and use `Ctrl+V`, or import the `.docx` file locally. Scanned or image-only equations cannot be converted directly.
- **Insertion appears slow:** keep the target document and artboard active and wait until insertion completes. The first SVG import can take longer.

## Use

1. Create or open an Illustrator document and activate the target artboard.
2. Paste or import an equation into the panel, or edit its LaTeX directly.
3. Choose the font, size, and color, then check the preview.
4. Click **Insert into artboard**. If the document or artboard changes while the equation is generated, insertion is cancelled to avoid placing it in the wrong location.
5. Use the export buttons for separate files and choose a local save destination.

Images, scanned equations, and legacy embedded equation objects cannot be recognized directly. Paste with `Ctrl+V` on Windows or `⌘V` on macOS; if CEP cannot read the clipboard through its button, paste into the input area instead.

## Privacy and offline operation

Typesetting libraries, vector glyphs, WOFF2 fonts, and both interface translations are bundled. No account, online service, or Node.js runtime is required. The panel’s Content Security Policy blocks network connections and remote resources. Word files are read in local memory. Insertion creates a temporary SVG on the local computer and removes it after import. The extension does not save or close existing documents.

## Uninstall

On Windows, double-click `Uninstall.cmd` for English prompts or `卸载插件.cmd` for Chinese. On macOS, use `Uninstall.command` or `卸载插件.command`. The uninstaller moves only this extension to its backup directory.

If installation previously enabled unsigned loading, the uninstaller separately asks whether to restore the original preference. Type `RESTORE` to restore it, or press Return to keep it. Windows restores the original registry value and type, or removes the value if it did not previously exist. If another program changed the preference after installation, the uninstaller does not overwrite that newer setting. Restoration may affect other unsigned CEP 12 extensions. Save your work and restart Illustrator afterward.

## Build and development checks

Run `python3 build_plugin.py` on macOS, or `py -3 build_plugin.py` on Windows, from the repository root to build the panel and ZIP from `upstream/Word公式转LaTeX.html`. On Windows without the `py` launcher, use `python build_plugin.py` with Python 3.9+. This command only builds files; it does not install the extension or change Adobe preferences.

For v1.1.0, installation from the Windows package and actual panel loading were verified on Windows 11, Python 3.14.4, and Illustrator 29.6.1 / CEP 12.1. Illustrator COM then invoked the installed insertion code with a panel-generated SVG, producing a 159 × 45 pt vector group with 27 paths, equation metadata, and no text, raster images, or linked images. This did not include an end-to-end click test of the panel’s insertion button. The Illustrator 30.5.1 macOS insertion result is from earlier testing; macOS was not retested in the application for this release. See the [v1.1.0 validation record](https://github.com/qiukefan/word-equation-illustrator/blob/main/docs/VALIDATION-1.1.0.md) for the complete scope. The first SVG import may be slow; wait until insertion finishes before trying again.

Licenses for KaTeX, MathJax, and fflate are embedded in the panel and listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
