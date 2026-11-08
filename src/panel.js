/* Illustrator panel adapter. No Node runtime, server, or network is required.
 * Load after the offline app; use the same native bridge as CSInterface.
 * Native file APIs are supplied by CEP; only user-chosen save paths are written.
 */
(function (root) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  if (!$('previewCard') || $('insertIllustratorButton')) return;
  document.body.classList.add('illustrator-panel');

  const actions = document.createElement('div');
  actions.className = 'illustrator-actions';
  actions.innerHTML = '<div class="illustrator-action-row"><button type="button" id="insertIllustratorButton" class="primary" disabled>插入当前画板</button><button type="button" id="refreshIllustratorButton" class="subtle-btn" title="检查当前 Illustrator 文档">刷新文档</button></div><p id="illustratorStatus" role="status">正在连接 Illustrator…</p><p class="illustrator-action-note">插入为可编辑的矢量路径 · 使用所选字体、字号和颜色</p>';
  $('previewCard').insertBefore(actions, $('previewCard').querySelector('.preview-surface'));
  document.title = '公式转写 · Illustrator';
  const localLabel = document.querySelector('header .local');
  if (localLabel) localLabel.textContent = '完全离线';
  const styleNote = document.querySelector('.formula-style-note');
  if (styleNote) styleNote.textContent = '用于预览、导出与插入 · 缩放仅用于查看';
  const previewNote = document.querySelector('.preview-footer span:last-child');
  if (previewNote) previewNote.textContent = '长公式可横向滚动';

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

  function message(text, error = false) {
    $('illustratorStatus').textContent = text;
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
    $('insertIllustratorButton').textContent = inserting ? '正在插入…' : '插入当前画板';
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
      if (!quiet) message(result.hasDocument ? '当前文档：' + (result.documentName || '未命名') + ' · 画板 ' + (Number(result.artboardIndex || 0) + 1) : '请先在 Illustrator 中新建或打开文档，再插入公式。');
    } catch (error) { available = false; message(error.message, true); }
    finally { refreshing = false; updateButton(); }
  }
  async function insertFormula() {
    if ($('insertIllustratorButton').disabled) return;
    const snapshot = {
      latex: unwrap($('outputCode').value),
      fontFamily: $('formulaFontFamily').value,
      fontSizePt: Number($('formulaFontSize').value),
      color: $('formulaColorPicker').value
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
      message('已插入矢量公式 · ' + root.WordFormulaFonts.get(snapshot.fontFamily).label + ' · ' + snapshot.fontSizePt + ' pt · ' + snapshot.color);
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
      const choice = root.cep.fs.showSaveDialogEx('保存公式文件', '', extension ? [extension] : [], name, '', '保存', '文件名');
      if (!choice || choice.err !== 0) throw new Error('无法打开保存对话框，请重试。');
      if (!choice.data) return {cancelled: true, name};
      const encoded = await base64Of(blob);
      const result = root.cep.fs.writeFile(choice.data, encoded, root.cep.encoding?.Base64 || 'Base64');
      if (!result || result.err !== 0) throw new Error('文件保存失败，请检查目标文件夹的权限和可用空间。');
      return {cancelled: false, name: String(choice.data).split(/[\\/]/).pop(), path: choice.data};
    } finally { saving = false; updateButton(); }
  }
  function downloadMessage(text, error, fileName) {
    message(text, error);
    if (/\.(?:svg|png)$/i.test(fileName)) {
      $('imageExportStatus').textContent = text;
      $('imageExportStatus').classList.toggle('error', Boolean(error));
    }
    // The original HTML has an immediate browser-download toast; native save
    // completion or cancellation is the authoritative result in Illustrator.
    $('toast').textContent = text; $('toast').hidden = false;
    setTimeout(() => { if ($('toast').textContent === text) $('toast').hidden = true; }, 3500);
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
      saveBlob(blob, name).then((result) => downloadMessage(result.cancelled ? '已取消保存。' : '已保存：' + result.name, false, name))
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
  if (cs) refreshDocument();
  else { message('浏览器预览：请在 Illustrator 的扩展面板中使用「插入当前画板」。'); updateButton(); }
  root.WordIllustratorPanel = Object.freeze({refreshDocument, saveBlob});
})(window);
