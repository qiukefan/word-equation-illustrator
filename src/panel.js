/* Illustrator panel adapter. No Node runtime, server, or network is required.
 * Load after the offline app; use the same native bridge as CSInterface.
 * Native file APIs are supplied by CEP; only user-chosen save paths are written.
 */
(function (root) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  if (!$('previewCard') || $('insertIllustratorButton')) return;
  if (root.WordI18n) root.WordI18n.register({
    "插入当前画板": "Insert into artboard",
    "正在插入…": "Inserting…",
    "刷新文档": "Refresh document",
    "检查当前 Illustrator 文档": "Check the active Illustrator document",
    "正在连接 Illustrator…": "Connecting to Illustrator…",
    "插入为可编辑的矢量路径 · 使用所选字体、字号和颜色": "Insert as editable vector paths · Uses the selected font, size, and color",
    "公式转写 · Illustrator": "Word → LaTeX · Illustrator",
    "完全离线": "Fully offline",
    "Word 文档与公式只在本机处理，不会上传。": "Word documents and equations are processed locally and never uploaded.",
    "用于预览、导出与插入 · 缩放仅用于查看": "Applies to preview, export, and insertion · Zoom is for viewing only",
    "长公式可横向滚动": "Scroll horizontally for long equations",
    "请在 Illustrator 的扩展面板中使用插入功能。": "Use the extension panel in Illustrator to insert equations.",
    "Illustrator 暂未响应。请关闭弹出的对话框后重试。": "Illustrator is not responding. Close any open dialog and try again.",
    "Illustrator 连接未就绪，请关闭并重新打开此面板。": "The Illustrator connection is not ready. Close and reopen this panel.",
    "Illustrator 无法完成此操作。": "Illustrator could not complete this operation.",
    "当前文档：{name} · 画板 {number}": "Document: {name} · Artboard {number}",
    "未命名": "Untitled",
    "请先在 Illustrator 中新建或打开文档，再插入公式。": "Create or open a document in Illustrator before inserting an equation.",
    "正在本机生成矢量公式…": "Generating vector paths locally…",
    "正在插入当前画板…": "Inserting into the active artboard…",
    "已插入矢量公式 · {font} · {size} pt · {color}": "Vector equation inserted · {font} · {size} pt · {color}",
    "插入失败，请检查当前文档后重试。": "Insertion failed. Check the active document and try again.",
    "无法读取待保存的文件。": "Could not read the file to save.",
    "文件编码失败。": "Could not encode the file.",
    "请先完成当前的文件保存。": "Finish saving the current file first.",
    "文件保存组件未就绪，请重新打开面板。": "File saving is not ready. Reopen the panel.",
    "文件过大，请降低 PNG 清晰度或改用 SVG。": "The file is too large. Reduce the PNG resolution or use SVG.",
    "保存公式文件": "Save equation file",
    "保存": "Save",
    "文件名": "File name",
    "第一次使用？关于 Word 公式粘贴": "First time? Pasting Word equations",
    "选中 Word 里的完整公式，按 Ctrl+C，再到左侧按 Ctrl+V。工具会读取浏览器能提供的公式结构；不同 Word 版本和浏览器的粘贴结果可能不同。": "Select the entire equation in Word and press Ctrl+C, then press Ctrl+V in the input box. The tool reads whatever equation structure the browser provides; results vary by Word version and browser.",
    "如果你的 Word 提供 LaTeX 格式，在公式选项中选择 LaTeX，再转为「线性」。普通文字粘贴可能丢失结构，请对照原公式核对。": "If your Word version offers LaTeX, choose it in the equation options and convert to Linear. Plain-text pasting can lose structure, so compare with the original equation.",
    "支持粘贴 MathML、OMML 或 LaTeX；Ctrl + Enter 立即转换。": "Paste MathML, OMML, or LaTeX; press Ctrl + Enter to convert.",
    "浏览器未允许自动复制。已选中当前公式代码，请按 Ctrl+C；全部公式可用「导出 .tex」保存。": "Automatic copying is unavailable. The current code is selected; press Ctrl+C to copy it. Use Export .tex to save all equations.",
    "请在左侧输入框按 Ctrl+V 粘贴；当前浏览器未允许按钮读取剪贴板。": "Press Ctrl+V in the input box to paste. This browser did not allow the button to read the clipboard.",
    "无法打开保存对话框，请重试。": "Could not open the save dialog. Try again.",
    "文件保存失败，请检查目标文件夹的权限和可用空间。": "Could not save the file. Check folder permissions and available space.",
    "已取消保存。": "Save cancelled.",
    "已保存：{name}": "Saved: {name}",
    "此面板完全离线。需要在线帮助时，请在浏览器中自行打开相关页面。": "This panel works entirely offline. Open online help separately in your browser.",
    "浏览器预览：请在 Illustrator 的扩展面板中使用「插入当前画板」。": "Browser preview: use “Insert into artboard” in the Illustrator extension panel.",
    "请求数据格式无效。": "The request data format is invalid.",
    "请求数据中的字符转义无效。": "The request contains an invalid character escape.",
    "请求数据含有无效控制字符。": "The request contains an invalid control character.",
    "请求数据中的字符串未结束。": "A string in the request is incomplete.",
    "请求数据嵌套过深。": "The request contains too many nested levels.",
    "请求包含不支持的字段。": "The request contains an unsupported field.",
    "请求包含重复字段。": "The request contains a duplicate field.",
    "请求数据未结束。": "The request data is incomplete.",
    "请求包含无效数字。": "The request contains an invalid number.",
    "请求末尾含有无效数据。": "The request has invalid trailing data.",
    "Illustrator 插入公式失败，请重试。": "Illustrator could not insert the equation. Try again.",
    "公式插入请求无效。": "The equation insertion request is invalid.",
    "公式 SVG 为空或过大，请拆分公式后插入。": "The equation SVG is empty or too large. Split the equation before inserting it.",
    "公式尺寸超出 Illustrator 支持范围，请减小字号或拆分公式。": "The equation exceeds Illustrator’s size limit. Reduce its font size or split the equation.",
    "公式代码为空或过长，请检查后重试。": "The equation code is empty or too long. Check it and try again.",
    "公式字号应在 4–96 pt 之间。": "The equation font size must be between 4 and 96 pt.",
    "公式字体无效，请重新选择。": "The equation font is invalid. Select it again.",
    "公式颜色无效，请重新选择。": "The equation color is invalid. Select it again.",
    "公式 SVG 含有外部引用或不支持的内容。": "The equation SVG contains external references or unsupported content.",
    "公式 SVG 格式无效。": "The equation SVG format is invalid.",
    "公式 SVG 不是独立矢量路径，请重新生成后插入。": "The equation SVG is not made of self-contained vector paths. Generate it again before inserting.",
    "公式尺寸与 SVG 不一致，请重新生成后插入。": "The equation dimensions do not match its SVG. Generate it again before inserting.",
    "无法建立本地临时文件，请稍后重试。": "Could not create a local temporary file. Try again later.",
    "公式插入请求为空或过大。": "The equation insertion request is empty or too large.",
    "请先在 Illustrator 中新建或打开一个文档，再插入公式。": "Create or open an Illustrator document before inserting an equation.",
    "当前文档已切换，请重新点击插入公式。": "The active document changed. Click Insert into artboard again.",
    "当前画板已切换，请重新点击插入公式。": "The active artboard changed. Click Insert into artboard again.",
    "无法写入本地临时 SVG，请检查临时文件夹权限。": "Could not write the temporary SVG. Check temporary folder permissions.",
    "写入本地临时 SVG 失败。": "Could not write the temporary SVG.",
    "Illustrator 无法打开生成的公式 SVG。": "Illustrator could not open the generated equation SVG.",
    "导入内容不是独立矢量路径，已取消插入。": "The imported content is not made of self-contained vector paths. Insertion was cancelled.",
    "生成的公式画布尺寸无效。": "The generated equation canvas dimensions are invalid.",
    "公式中没有可插入的矢量图形。": "The equation has no vector paths to insert.",
    "导入的公式画布边界无效。": "The imported equation canvas bounds are invalid."
});
  const t = (text, params) => root.WordI18n ? root.WordI18n.t(text, params) : String(text).replace(/\{(\w+)\}/g, (match, key) => params && key in params ? String(params[key]) : match);
  document.body.classList.add('illustrator-panel');

  const actions = document.createElement('div');
  actions.className = 'illustrator-actions';
  actions.innerHTML = '<div class="illustrator-action-row"><button type="button" id="insertIllustratorButton" class="primary" disabled data-i18n="插入当前画板">插入当前画板</button><button type="button" id="refreshIllustratorButton" class="subtle-btn" title="检查当前 Illustrator 文档" data-i18n-title="检查当前 Illustrator 文档" data-i18n="刷新文档">刷新文档</button></div><p id="illustratorStatus" role="status">正在连接 Illustrator…</p><p class="illustrator-action-note" data-i18n="插入为可编辑的矢量路径 · 使用所选字体、字号和颜色">插入为可编辑的矢量路径 · 使用所选字体、字号和颜色</p>';
  $('previewCard').insertBefore(actions, $('previewCard').querySelector('.preview-surface'));
  const localLabel = document.querySelector('header .local');
  if (localLabel) localLabel.setAttribute('data-i18n', '完全离线');
  const privacyNote = $('privacyNote');
  if (privacyNote) privacyNote.setAttribute('data-i18n', 'Word 文档与公式只在本机处理，不会上传。');
  const styleNote = document.querySelector('.formula-style-note');
  if (styleNote) styleNote.setAttribute('data-i18n', '用于预览、导出与插入 · 缩放仅用于查看');
  const previewNote = document.querySelector('.preview-footer > span:last-child');
  if (previewNote) previewNote.setAttribute('data-i18n', '长公式可横向滚动');

  // The reusable upstream app was designed for macOS. Adapt only known UI
  // messages on Windows; equation text and the bundled upstream stay untouched.
  if (/Win/i.test(root.navigator.platform || '')) {
    const shortcuts = new Map([
      ['支持粘贴 MathML、OMML 或 LaTeX；⌘ + Enter 立即转换。', '支持粘贴 MathML、OMML 或 LaTeX；Ctrl + Enter 立即转换。'],
      ['Paste MathML, OMML, or LaTeX; press ⌘ + Enter to convert.', '支持粘贴 MathML、OMML 或 LaTeX；Ctrl + Enter 立即转换。'],
      ['浏览器未允许自动复制。已选中当前公式代码，请按 ⌘C；全部公式可用「导出 .tex」保存。', '浏览器未允许自动复制。已选中当前公式代码，请按 Ctrl+C；全部公式可用「导出 .tex」保存。'],
      ['Automatic copying is unavailable. The current code is selected; press ⌘C to copy it. Use Export .tex to save all equations.', '浏览器未允许自动复制。已选中当前公式代码，请按 Ctrl+C；全部公式可用「导出 .tex」保存。'],
      ['请在左侧输入框按 ⌘V 粘贴；当前浏览器未允许按钮读取剪贴板。', '请在左侧输入框按 Ctrl+V 粘贴；当前浏览器未允许按钮读取剪贴板。'],
      ['Press ⌘V in the input box to paste. This browser did not allow the button to read the clipboard.', '请在左侧输入框按 Ctrl+V 粘贴；当前浏览器未允许按钮读取剪贴板。']
    ]);
    const guide = new Map([
      ['第一次使用？关于 Mac 上的 Word 公式粘贴', '第一次使用？关于 Word 公式粘贴'],
      ['选中 Word 里的完整公式，按 ⌘C，再到左侧按 ⌘V。工具会读取浏览器能提供的公式结构；不同 Word 版本和浏览器的粘贴结果可能不同。', '选中 Word 里的完整公式，按 Ctrl+C，再到左侧按 Ctrl+V。工具会读取浏览器能提供的公式结构；不同 Word 版本和浏览器的粘贴结果可能不同。'],
      ['如果你的 Word 提供 LaTeX 格式，在公式选项中选择 LaTeX，再转为「线性」。Mac 快捷键为 ⌘⇧=。普通文字粘贴可能丢失结构，请对照原公式核对。', '如果你的 Word 提供 LaTeX 格式，在公式选项中选择 LaTeX，再转为「线性」。普通文字粘贴可能丢失结构，请对照原公式核对。']
    ]);
    document.querySelectorAll('#pasteHint kbd').forEach((key) => { if (key.textContent === '⌘') key.textContent = 'Ctrl'; });
    document.querySelectorAll('#guide [data-i18n]').forEach((element) => {
      const replacement = guide.get(element.getAttribute('data-i18n'));
      if (replacement) { element.setAttribute('data-i18n', replacement); element.textContent = t(replacement); }
    });
    const hintElements = [$('inputNote'), $('status')].filter(Boolean);
    const adaptShortcuts = () => hintElements.forEach((element) => {
      const replacement = shortcuts.get(element.textContent);
      if (replacement) element.textContent = t(replacement);
    });
    const shortcutObserver = new MutationObserver(adaptShortcuts);
    hintElements.forEach((element) => shortcutObserver.observe(element, {childList: true}));
    adaptShortcuts();
  }

  let cs = null;
  let inserting = false;
  let refreshing = false;
  let saving = false;
  let available = false;
  try {
    if (root.__adobe_cep__ && typeof root.__adobe_cep__.evalScript === 'function') {
      cs = {evalScript: root.__adobe_cep__.evalScript.bind(root.__adobe_cep__)};
    } else if (root.__adobe_cep__ && typeof root.CSInterface === 'function') cs = new root.CSInterface();
  } catch { /* The browser can still show a faithful, non-mutating panel preview. */ }

  let statusText = () => t('正在连接 Illustrator…');
  let saveNoticeId = 0;
  function message(text, error = false) {
    statusText = typeof text === 'function' ? text : () => t(text);
    $('illustratorStatus').textContent = statusText();
    $('illustratorStatus').classList.toggle('error', error);
  }
  function unwrap(value) {
    const text = value.trim();
    if ((text.startsWith('\\[') && text.endsWith('\\]')) || (text.startsWith('\\(') && text.endsWith('\\)')) || (text.startsWith('$$') && text.endsWith('$$'))) return text.slice(2, -2).trim();
    if (text.startsWith('$') && text.endsWith('$') && text.length > 1) return text.slice(1, -1);
    return text;
  }
  function updateButton() {
    $('insertIllustratorButton').disabled = !cs || !available || inserting || saving || refreshing || !$('preview').querySelector('.katex-html') || $('exportSvgButton').disabled || !unwrap($('outputCode').value);
    $('insertIllustratorButton').textContent = t(inserting ? '正在插入…' : '插入当前画板');
    $('refreshIllustratorButton').disabled = !cs || inserting || saving || refreshing;
  }
  function hostCall(script, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      if (!cs) { reject(new Error('请在 Illustrator 的扩展面板中使用插入功能。')); return; }
      let settled = false;
      const timer = timeoutMs ? setTimeout(() => {
        settled = true;
        reject(new Error('Illustrator 暂未响应。请关闭弹出的对话框后重试。'));
      }, timeoutMs) : null;
      try {
        cs.evalScript(script, (value) => {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          let result;
          try { result = JSON.parse(value); }
          catch { reject(new Error('Illustrator 连接未就绪，请关闭并重新打开此面板。')); return; }
          try {
            if (!result || result.ok !== true) throw new Error(result?.error || 'Illustrator 无法完成此操作。');
            resolve(result);
          } catch (error) {
            reject(new Error(error.message || 'Illustrator 无法完成此操作。'));
          }
        });
      } catch (error) {
        if (timer) clearTimeout(timer);
        reject(error);
      }
    });
  }
  async function refreshDocument(quiet = false) {
    if (!cs || inserting || saving || refreshing) return;
    refreshing = true; updateButton();
    try {
      const result = await hostCall('WordEquationAI.status()');
      available = true;
      if (!quiet) message(() => result.hasDocument ? t('当前文档：{name} · 画板 {number}', {name: result.documentName || t('未命名'), number: Number(result.artboardIndex || 0) + 1}) : t('请先在 Illustrator 中新建或打开文档，再插入公式。'));
    } catch (error) { available = false; message(error.message, true); }
    finally { refreshing = false; updateButton(); }
  }
  async function insertFormula() {
    if ($('insertIllustratorButton').disabled) return;
    const snapshot = {
      latex: unwrap($('outputCode').value),
      fontFamily: $('formulaFontFamily').value,
      fontSizePt: Number($('formulaFontSize').value),
      color: $('formulaColorPicker').value,
      language: root.WordI18n ? root.WordI18n.language : 'zh'
    };
    inserting = true; updateButton();
    message('正在本机生成矢量公式…');
    try {
      const target = await hostCall('WordEquationAI.status()');
      if (!target.hasDocument) throw new Error('请先在 Illustrator 中新建或打开文档，再插入公式。');
      const vector = await root.WordImageExport.svg(snapshot.latex, {
        fontFamily: snapshot.fontFamily, fontSizePt: snapshot.fontSizePt,
        color: snapshot.color, background: 'transparent', padding: 0
      });
      const payload = {...snapshot, svg: await vector.blob.text(), widthPt: vector.width * 0.75, heightPt: vector.height * 0.75,
        targetDocumentToken: target.documentToken, targetArtboardIndex: target.artboardIndex};
      const argument = JSON.stringify(encodeURIComponent(JSON.stringify(payload)));
      message('正在插入当前画板…');
      // A mutating host operation intentionally has no automatic timeout: an
      // outstanding import must finish before a second click can duplicate it.
      await hostCall('WordEquationAI.insertSvg(' + argument + ')', 0);
      message(() => t('已插入矢量公式 · {font} · {size} pt · {color}', {font: t(root.WordFormulaFonts.get(snapshot.fontFamily).label), size: snapshot.fontSizePt, color: snapshot.color}));
    } catch (error) { message(error.message || '插入失败，请检查当前文档后重试。', true); }
    finally { inserting = false; updateButton(); }
  }
  $('insertIllustratorButton').addEventListener('click', insertFormula);
  $('refreshIllustratorButton').addEventListener('click', () => refreshDocument());
  document.addEventListener('input', updateButton);
  document.addEventListener('change', updateButton);
  const observer = new MutationObserver(updateButton);
  observer.observe($('preview'), {childList: true, subtree: true});
  observer.observe($('exportSvgButton'), {attributes: true, attributeFilter: ['disabled']});
  root.addEventListener('focus', () => { if (available) refreshDocument(true); });

  // Keep the reusable app's existing export buttons. CEP's native save dialog
  // replaces a browser download, and FileReader preserves arbitrary PNG bytes.
  function base64Of(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('无法读取待保存的文件。'));
      reader.onload = () => {
        const value = String(reader.result), split = value.indexOf(',');
        if (split < 0) reject(new Error('文件编码失败。'));
        else resolve(value.slice(split + 1));
      };
      reader.readAsDataURL(blob);
    });
  }
  async function saveBlob(blob, fileName) {
    if (saving) throw new Error('请先完成当前的文件保存。');
    if (!root.cep?.fs?.showSaveDialogEx || !root.cep.fs.writeFile) throw new Error('文件保存组件未就绪，请重新打开面板。');
    if (blob.size > 64 * 1024 * 1024) throw new Error('文件过大，请降低 PNG 清晰度或改用 SVG。');
    saving = true; updateButton();
    try {
      const name = String(fileName).split(/[\\/]/).pop() || 'equation.svg';
      const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
      const filterLabel = extension ? extension.toUpperCase() + ' (*.' + extension + ')' : '';
      const choice = root.cep.fs.showSaveDialogEx(t('保存公式文件'), '', extension ? [extension] : [], name, filterLabel, t('保存'), t('文件名'));
      if (!choice || choice.err !== 0) throw new Error('无法打开保存对话框，请重试。');
      if (!choice.data) return {cancelled: true, name};
      const encoded = await base64Of(blob);
      const result = root.cep.fs.writeFile(choice.data, encoded, root.cep.encoding?.Base64 || 'Base64');
      if (!result || result.err !== 0) throw new Error('文件保存失败，请检查目标文件夹的权限和可用空间。');
      return {cancelled: false, name: String(choice.data).split(/[\\/]/).pop(), path: choice.data};
    } finally { saving = false; updateButton(); }
  }
  function downloadMessage(text, error, fileName) {
    text = t(text);
    message(text, error);
    if (/\.(?:svg|png)$/i.test(fileName)) {
      $('imageExportStatus').textContent = text;
      $('imageExportStatus').classList.toggle('error', Boolean(error));
    }
    // The original HTML has an immediate browser-download toast; native save
    // completion or cancellation is the authoritative result in Illustrator.
    $('toast').textContent = text; $('toast').hidden = false;
    const noticeId = ++saveNoticeId;
    setTimeout(() => { if (saveNoticeId === noticeId) $('toast').hidden = true; }, 3500);
  }
  if (cs) {
    const blobs = new Map();
    const create = root.URL.createObjectURL.bind(root.URL);
    const revoke = root.URL.revokeObjectURL.bind(root.URL);
    const click = root.HTMLAnchorElement.prototype.click;
    root.URL.createObjectURL = function (blob) { const url = create(blob); if (blob instanceof Blob) blobs.set(url, blob); return url; };
    root.URL.revokeObjectURL = function (url) { blobs.delete(url); return revoke(url); };
    root.HTMLAnchorElement.prototype.click = function () {
      const blob = this.download && blobs.get(this.href);
      if (!blob) return click.call(this);
      const name = this.download;
      saveBlob(blob, name).then((result) => downloadMessage(result.cancelled ? t('已取消保存。') : t('已保存：{name}', {name: result.name}), false, name))
        .catch((error) => downloadMessage(error.message, true, name));
    };
  }

  // An offline panel never navigates out to web pages from its help content.
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest?.('a[href]');
    if (anchor && /^(?:https?:|\/\/)/i.test(anchor.getAttribute('href') || '')) {
      event.preventDefault(); event.stopImmediatePropagation();
      message('此面板完全离线。需要在线帮助时，请在浏览器中自行打开相关页面。');
    }
  }, true);
  function refreshLanguage() {
    document.title = t('公式转写 · Illustrator');
    if (root.WordI18n) {
      root.WordI18n.refresh(actions);
      [localLabel, privacyNote, styleNote, previewNote].filter(Boolean).forEach((element) => { element.textContent = t(element.getAttribute('data-i18n')); });
    }
    $('illustratorStatus').textContent = statusText();
    $('imageExportStatus').textContent = t($('imageExportStatus').textContent);
    $('toast').textContent = t($('toast').textContent);
    updateButton();
  }
  root.addEventListener('word-language-change', refreshLanguage);
  refreshLanguage();
  if (cs) refreshDocument();
  else { message('浏览器预览：请在 Illustrator 的扩展面板中使用「插入当前画板」。'); updateButton(); }
  root.WordIllustratorPanel = Object.freeze({refreshDocument, saveBlob});
})(window);
