# Word → LaTeX · Offline Illustrator Extension

[简体中文](使用说明.md)

For Illustrator 2026 on macOS (30.x, CEP 12). This is an unsigned CEP development extension and is not published on Adobe Marketplace.

## Features

- Switch between **中文** and **English** using the language selector in the top-right corner. The current equation, font, size, and color are preserved.
- Paste native Word equations, or import a local `.docx` file to extract equations.
- Edit LaTeX and choose from 11 mathematical font styles, sizes from 4 to 96 pt, and hexadecimal colors.
- Export PNG, SVG, `.tex`, and `.md` files through native macOS save dialogs.
- Click **Insert into artboard** to place an editable vector group at the center of the active Illustrator artboard.
- Each insertion creates an **Equation** layer (**公式** when the interface is Chinese). The chosen physical font size is preserved; preview zoom does not change insertion size.

Inserted equations are vector paths, so they do not require installed fonts. The group note retains the LaTeX and style settings. This version cannot reload a selected equation for editing. Calligraphic and script styles mainly cover uppercase Latin letters; other characters retain their mathematical glyphs.

## Install

Python 3.9 or later is required. The launchers use `/usr/bin/python3`.

1. Fully extract `Word公式转LaTeX-Illustrator-1.0.0.zip`.
2. Double-click `Install.command` for English installer prompts. `安装到Illustrator.command` provides Chinese prompts.
3. Adobe does not load unsigned CEP extensions by default. If needed, the installer explains the `com.adobe.CSXS.12` / `PlayerDebugMode = 1` preference and requires you to type `ENABLE` before continuing. Press Return to cancel without changing settings or installation files. This preference allows **all CEP 12 hosts** to load unsigned extensions.
4. Save your work, then close and reopen Illustrator yourself.
5. Open **Window → Extensions → Word → LaTeX**.
6. Choose **English** in the panel’s top-right language selector.

No administrator privileges are required. Files are copied only to `~/Library/Application Support/Adobe/CEP/extensions/local.word-equation.illustrator`. An existing extension with the same identifier is moved first to `~/Library/Application Support/WordEquationIllustrator/Backups`. The installer does not close Illustrator, change macOS Gatekeeper, install Rosetta, or upload files.

To retain Adobe’s default signature verification, do not install this development build yet. A signed ZXP can be created later in an environment with Adobe’s `ZXPSignCmd`; this repository contains no signing certificates or tools.

For command-line installation with English prompts:

```sh
python3 install.py --language en
```

## Use

1. Create or open an Illustrator document and activate the target artboard.
2. Paste or import an equation into the panel, or edit its LaTeX directly.
3. Choose the font, size, and color, then check the preview.
4. Click **Insert into artboard**. If the document or artboard changes while the equation is generated, insertion is cancelled to avoid placing it in the wrong location.
5. Use the export buttons for separate files and choose a local save destination.

Images, scanned equations, and legacy embedded equation objects cannot be recognized directly. Paste with `⌘V`; if CEP cannot read the clipboard through its button, paste into the input area instead.

## Privacy and offline operation

Typesetting libraries, vector glyphs, WOFF2 fonts, and both interface translations are bundled. No account, online service, or Node.js runtime is required. The panel’s Content Security Policy blocks network connections and remote resources. Word files are read in local memory. Insertion creates a temporary SVG on the local computer and removes it after import. The extension does not save or close existing documents.

## Uninstall

Double-click `Uninstall.command` for English prompts, or `卸载插件.command` for Chinese. The uninstaller moves only this extension to its backup directory. If installation previously enabled unsigned loading, it separately asks whether to restore the original preference. Type `RESTORE` to restore it, or press Return to keep it. Restoring it may affect other unsigned CEP 12 extensions.

## Build and development checks

Run `python3 build_plugin.py` from the repository root to build the panel and ZIP from `upstream/Word公式转LaTeX.html`. This command only builds files; it does not install the extension or change Adobe preferences.

See the [README](README.md#development-checks) for browser-based checks with a simulated Illustrator bridge. Real insertion was also tested in Illustrator 30.5.1 with synthetic vector artwork. The first SVG import may be slow; wait until insertion finishes before trying again.

Licenses for KaTeX, MathJax, and fflate are embedded in the panel and listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
