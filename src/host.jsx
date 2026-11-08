/* Illustrator host bridge. ExtendScript / ES3; no network or external process.
 * Only app.open's temporary SVG document is ever closed. User artwork is not
 * saved, replaced, outlined, unlocked, or deleted by this bridge.
 */
var WordEquationAI = (function () {
    var MAX_SVG = 8000000;
    var MAX_POINT_SIZE = 16348;
    var documents = [];
    var documentCounter = 0;
    var sessionId = String(new Date().getTime()) + String(Math.floor(Math.random() * 1000000));

    function fail(message) { throw new Error(message); }
    function isFiniteNumber(value) { return typeof value === 'number' && isFinite(value); }

    /* Parse JSON without eval: ExtendScript installations need not expose JSON. */
    function parseJSON(text) {
        var offset = 0;
        function white() { while (offset < text.length && /[\x20\t\r\n]/.test(text.charAt(offset))) offset++; }
        function string() {
            var output = '', character, code, hex;
            if (text.charAt(offset++) !== '"') fail('请求数据格式无效。');
            while (offset < text.length) {
                character = text.charAt(offset++);
                if (character === '"') return output;
                if (character === '\\') {
                    character = text.charAt(offset++);
                    if (character === 'u') {
                        hex = text.substr(offset, 4);
                        if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail('请求数据中的字符转义无效。');
                        output += String.fromCharCode(parseInt(hex, 16)); offset += 4;
                    } else {
                        code = {'"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t'}[character];
                        if (typeof code !== 'string') fail('请求数据中的字符转义无效。');
                        output += code;
                    }
                } else {
                    if (character.charCodeAt(0) < 32) fail('请求数据含有无效控制字符。');
                    output += character;
                }
            }
            fail('请求数据中的字符串未结束。');
        }
        function value(depth) {
            if (depth > 20) fail('请求数据嵌套过深。');
            white();
            var character = text.charAt(offset), result, key, match;
            if (character === '"') return string();
            if (character === '{') {
                offset++; result = {}; white();
                if (text.charAt(offset) === '}') { offset++; return result; }
                while (offset < text.length) {
                    white(); key = string(); white();
                    if (key === '__proto__' || key === 'constructor' || key === 'prototype') fail('请求包含不支持的字段。');
                    if (Object.prototype.hasOwnProperty.call(result, key)) fail('请求包含重复字段。');
                    if (text.charAt(offset++) !== ':') fail('请求数据格式无效。');
                    result[key] = value(depth + 1); white();
                    character = text.charAt(offset++);
                    if (character === '}') return result;
                    if (character !== ',') fail('请求数据格式无效。');
                }
                fail('请求数据未结束。');
            }
            if (character === '[') {
                offset++; result = []; white();
                if (text.charAt(offset) === ']') { offset++; return result; }
                while (offset < text.length) {
                    result.push(value(depth + 1)); white(); character = text.charAt(offset++);
                    if (character === ']') return result;
                    if (character !== ',') fail('请求数据格式无效。');
                }
                fail('请求数据未结束。');
            }
            if (text.substr(offset, 4) === 'true') { offset += 4; return true; }
            if (text.substr(offset, 5) === 'false') { offset += 5; return false; }
            if (text.substr(offset, 4) === 'null') { offset += 4; return null; }
            match = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(text.substr(offset));
            if (!match) fail('请求数据格式无效。');
            offset += match[0].length; result = Number(match[0]);
            if (!isFiniteNumber(result)) fail('请求包含无效数字。');
            return result;
        }
        var parsed = value(0); white();
        if (offset !== text.length) fail('请求末尾含有无效数据。');
        return parsed;
    }

    function quote(text) {
        return '"' + String(text).replace(/["\\\x00-\x1f\u2028\u2029]/g, function (character) {
            var escapes = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
            if (escapes[character]) return escapes[character];
            return '\\u' + ('0000' + character.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    }
    function stringify(value) {
        if (value === null) return 'null';
        if (typeof value === 'string') return quote(value);
        if (typeof value === 'number') return isFiniteNumber(value) ? String(value) : 'null';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        var list = [], key, i;
        if (Object.prototype.toString.call(value) === '[object Array]') {
            for (i = 0; i < value.length; i++) list.push(stringify(value[i]));
            return '[' + list.join(',') + ']';
        }
        for (key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key) && typeof value[key] !== 'undefined') list.push(quote(key) + ':' + stringify(value[key]));
        }
        return '{' + list.join(',') + '}';
    }
    function errorResult(error) {
        return stringify({ok: false, error: error && error.message ? String(error.message) : 'Illustrator 插入公式失败，请重试。'});
    }
    function tokenFor(document) {
        var i;
        for (i = 0; i < documents.length; i++) if (documents[i].document === document) return documents[i].token;
        var token = 'word-equation-' + sessionId + '-' + (++documentCounter);
        documents.push({document: document, token: token});
        if (documents.length > 64) documents.shift();
        return token;
    }
    function status() {
        try {
            var result = {ok: true, appVersion: String(app.version), hasDocument: app.documents.length > 0};
            if (result.hasDocument) {
                var document = app.activeDocument;
                result.documentName = String(document.name);
                result.documentToken = tokenFor(document);
                result.artboardIndex = document.artboards.getActiveArtboardIndex();
            }
            return stringify(result);
        } catch (error) { return errorResult(error); }
    }

    function validatePayload(payload) {
        if (!payload || Object.prototype.toString.call(payload) !== '[object Object]') fail('公式插入请求无效。');
        if (typeof payload.svg !== 'string' || !payload.svg.length || payload.svg.length > MAX_SVG) fail('公式 SVG 为空或过大，请拆分公式后插入。');
        if (!isFiniteNumber(payload.widthPt) || !isFiniteNumber(payload.heightPt) || payload.widthPt <= 0 || payload.heightPt <= 0 || payload.widthPt > MAX_POINT_SIZE || payload.heightPt > MAX_POINT_SIZE) fail('公式尺寸超出 Illustrator 支持范围，请减小字号或拆分公式。');
        if (typeof payload.latex !== 'string' || !payload.latex.replace(/\s/g, '').length || payload.latex.length > 200000) fail('公式代码为空或过长，请检查后重试。');
        if (!isFiniteNumber(payload.fontSizePt) || payload.fontSizePt < 4 || payload.fontSizePt > 96) fail('公式字号应在 4–96 pt 之间。');
        if (typeof payload.fontFamily !== 'string' || !/^(default|roman|bold|italic|bolditalic|caligraphic|script|fraktur|double-struck|sans|typewriter)$/.test(payload.fontFamily)) fail('公式字体无效，请重新选择。');
        if (typeof payload.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(payload.color)) fail('公式颜色无效，请重新选择。');
        var svg = payload.svg;
        if (/<!|<\?(?!xml\s)|\b(?:href|src|on[a-z]+)\s*=|url\s*\(/i.test(svg)) fail('公式 SVG 含有外部引用或不支持的内容。');
        var root = /^(?:\s*<\?xml\s[^?]*\?>)?\s*(<svg\s[^>]*>)/.exec(svg);
        if (!root || !/<\/svg>\s*$/.test(svg)) fail('公式 SVG 格式无效。');
        var allowed = {svg: true, g: true, defs: true, path: true, rect: true, line: true, polygon: true, polyline: true, ellipse: true, circle: true, title: true, desc: true};
        var tags = /<\/?([A-Za-z_][\w:.-]*)\b/g, tag;
        while ((tag = tags.exec(svg)) !== null) if (!allowed[tag[1]]) fail('公式 SVG 不是独立矢量路径，请重新生成后插入。');
        var width = /\bwidth\s*=\s*["']([0-9]+(?:\.[0-9]+)?)pt["']/.exec(root[1]);
        var height = /\bheight\s*=\s*["']([0-9]+(?:\.[0-9]+)?)pt["']/.exec(root[1]);
        if (!width || !height || Math.abs(Number(width[1]) - payload.widthPt) > 0.01 || Math.abs(Number(height[1]) - payload.heightPt) > 0.01) fail('公式尺寸与 SVG 不一致，请重新生成后插入。');
    }
    function temporarySvg() {
        var i, file;
        for (i = 0; i < 20; i++) {
            file = new File(Folder.temp.fsName + '/WordEquationAI-' + sessionId + '-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000000000) + '.svg');
            if (!file.exists) return file;
        }
        fail('无法建立本地临时文件，请稍后重试。');
    }
    function restoreSelection(document, selection) {
        try { document.selection = selection; return; } catch (ignored) {}
        try {
            document.selection = null;
            if (selection && typeof selection.length === 'number') {
                for (var i = 0; i < selection.length; i++) try { selection[i].selected = true; } catch (ignoredItem) {}
            }
        } catch (ignoredSelection) {}
    }
    function insertSvg(payloadEncoded) {
        var target = null, source = null, file = null, layer = null, imported = null;
        var previousLayer, previousSelection, previousInteraction, previousCoordinates;
        var interactionChanged = false, coordinatesChanged = false, success = false;
        try {
            if (typeof payloadEncoded !== 'string' || payloadEncoded.length > MAX_SVG * 4) fail('公式插入请求为空或过大。');
            var payload = parseJSON(decodeURIComponent(payloadEncoded));
            validatePayload(payload);
            if (!app.documents.length) fail('请先在 Illustrator 中新建或打开一个文档，再插入公式。');
            target = app.activeDocument;
            var artboardIndex = target.artboards.getActiveArtboardIndex();
            if (typeof payload.targetDocumentToken !== 'undefined' && payload.targetDocumentToken !== tokenFor(target)) fail('当前文档已切换，请重新点击插入公式。');
            if (typeof payload.targetArtboardIndex !== 'undefined' && payload.targetArtboardIndex !== artboardIndex) fail('当前画板已切换，请重新点击插入公式。');
            previousLayer = target.activeLayer; previousSelection = target.selection;
            previousInteraction = app.userInteractionLevel;
            app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS; interactionChanged = true;
            previousCoordinates = app.coordinateSystem;
            app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM; coordinatesChanged = true;
            var targetRect = target.artboards[artboardIndex].artboardRect;
            file = temporarySvg(); file.encoding = 'UTF-8'; file.lineFeed = 'Unix';
            if (!file.open('w')) fail('无法写入本地临时 SVG，请检查临时文件夹权限。');
            try { if (!file.write(payload.svg)) fail('写入本地临时 SVG 失败。'); } finally { file.close(); }
            source = app.open(file, DocumentColorSpace.RGB);
            if (!source || source === target) fail('Illustrator 无法打开生成的公式 SVG。');
            if (source.textFrames.length || source.rasterItems.length || source.placedItems.length) fail('导入内容不是独立矢量路径，已取消插入。');
            var sourceRect = source.artboards[source.artboards.getActiveArtboardIndex()].artboardRect;
            var sourceWidth = Math.abs(sourceRect[2] - sourceRect[0]);
            var sourceHeight = Math.abs(sourceRect[1] - sourceRect[3]);
            if (!(sourceWidth > 0) || !(sourceHeight > 0)) fail('生成的公式画布尺寸无效。');
            var items = [], i;
            for (i = 0; i < source.pageItems.length; i++) if (source.pageItems[i].parent.typename === 'Layer') items.push(source.pageItems[i]);
            if (!items.length) fail('公式中没有可插入的矢量图形。');
            var sourceGroup = source.groupItems.add();
            for (i = 0; i < items.length; i++) items[i].move(sourceGroup, ElementPlacement.PLACEATEND);
            // Keep the SVG viewport as an invisible boundary. Resizing an ink-only
            // bound to the viewport would enlarge the nominal formula font size.
            var frameName = 'WordEquationAI Viewport ' + sessionId;
            var frame = sourceGroup.pathItems.rectangle(sourceRect[1], sourceRect[0], sourceWidth, sourceHeight);
            frame.name = frameName; frame.filled = false; frame.stroked = false;
            target.activate();
            layer = target.layers.add(); layer.name = payload.language === 'en' ? 'Equation' : '公式';
            imported = sourceGroup.duplicate(layer, ElementPlacement.PLACEATBEGINNING);
            var importedFrame = imported.pathItems.getByName(frameName);
            var frameWidth = importedFrame.width, frameHeight = importedFrame.height;
            if (!(frameWidth > 0) || !(frameHeight > 0)) fail('导入的公式画布边界无效。');
            if (Math.abs(frameWidth - payload.widthPt) > 0.01 || Math.abs(frameHeight - payload.heightPt) > 0.01) {
                imported.resize(payload.widthPt / frameWidth * 100, payload.heightPt / frameHeight * 100, true, true, true, true, 100, Transformation.CENTER);
            }
            var bounds = importedFrame.geometricBounds;
            imported.translate((targetRect[0] + targetRect[2] - bounds[0] - bounds[2]) / 2, (targetRect[1] + targetRect[3] - bounds[1] - bounds[3]) / 2);
            imported.name = (payload.language === 'en' ? 'Equation · ' : '公式 · ') + payload.latex.replace(/\s+/g, ' ').substr(0, 48);
            var metadataSaved = true;
            try { imported.note = 'WordEquationAI ' + stringify({version: 1, latex: payload.latex, fontFamily: payload.fontFamily, fontSizePt: payload.fontSizePt, color: payload.color, widthPt: payload.widthPt, heightPt: payload.heightPt}); }
            catch (metadataError) { metadataSaved = false; }
            target.selection = null; imported.selected = true;
            success = true;
            return stringify({ok: true, documentName: String(target.name), documentToken: tokenFor(target), artboardIndex: artboardIndex, widthPt: payload.widthPt, heightPt: payload.heightPt, metadataSaved: metadataSaved});
        } catch (error) { return errorResult(error); }
        finally {
            if (!success && layer) try { layer.remove(); } catch (ignoredLayer) {}
            if (source && source !== target) try { source.close(SaveOptions.DONOTSAVECHANGES); } catch (ignoredSource) {}
            if (file) try { if (file.exists) file.remove(); } catch (ignoredFile) {}
            if (target) {
                try { target.activate(); } catch (ignoredTarget) {}
                if (!success) {
                    if (previousLayer) try { target.activeLayer = previousLayer; } catch (ignoredActiveLayer) {}
                    if (typeof previousSelection !== 'undefined') restoreSelection(target, previousSelection);
                }
            }
            if (coordinatesChanged) try { app.coordinateSystem = previousCoordinates; } catch (ignoredCoordinates) {}
            if (interactionChanged) try { app.userInteractionLevel = previousInteraction; } catch (ignoredInteraction) {}
        }
    }
    return {status: status, insertSvg: insertSvg};
}());
