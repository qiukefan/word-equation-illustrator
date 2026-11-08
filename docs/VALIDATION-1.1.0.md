# v1.1.0 验证记录 / Validation record

本记录说明 Windows 支持的实际验证范围，区分真实 Illustrator 运行结果与模拟检查。测试使用合成公式，不包含个人文档、账户信息或机器目录。

## Windows 实机验证

| 项目 | 环境或结果 |
| --- | --- |
| 系统 | Windows 11，build 22631 |
| 安装 Python | 3.14.4 |
| Illustrator | 2025，29.6.1 |
| 内置 CEP | 12.1 |
| 安装来源 | 完整解压的 `WordEquationIllustrator-1.1.0-windows.zip` |
| 安装结果 | 安装成功；Illustrator 扩展菜单中出现插件，面板实际加载并可见 |
| 原生插入入口 | Illustrator COM `DoJavaScript` 调用已安装的 `host.jsx` |
| 输入 | 来自浏览器面板测试的真实 SVG；公式 `A_{ij} + \frac{B}{C} = \int_0^1 x\,dx`，18 pt，蓝色 |
| 插入对象 | `GroupItem`，159 × 45 pt，27 条路径 |
| 画板居中 | 600 × 600 pt 画板上，对象中心为 `(300, 300)` pt |
| 公式元数据 | 已保留 |
| 文本 / 栅格 / 链接对象 | `textFrames=0`、`rasterItems=0`、`placedItems=0` |

面板已在真实 Illustrator 中打开；原生 SVG 插入已通过已安装的宿主代码验证。测试工具无法定位 CEP 子窗口内的控件，因此没有完成“点击面板插入按钮 → 经 CEP 桥接 → 生成对象”的端到端点击验证。COM 验证使用相同的已安装宿主插入代码，但不覆盖该按钮的实际点击与 CEP 桥接链路。

## 自动检查

| 检查 | 结果与范围 |
| --- | --- |
| 安装器 | 16 项分别在 Python 3.12、3.14 通过 |
| 面板集成 | 11 项分别在 Win32、MacIntel 模拟平台通过；Illustrator 桥接和文件保存对话框使用模拟实现 |
| 安装包 | 3 项通过 |

模拟面板检查不读取用户文档或剪贴板，也不执行真实 Illustrator 插入或文件保存。MacIntel 模拟结果不代表 macOS 实机验证。

## macOS 既有记录

此前曾在 macOS Illustrator 30.5.1 中运行插入代码，生成 159 × 45 pt 的居中矢量公式，无文本、栅格图或链接图。v1.1.0 本次发布没有重新进行 macOS 实机测试。

## English summary

Installation from the extracted Windows package and visible panel loading were verified on Windows 11 build 22631, Python 3.14.4, and Illustrator 29.6.1 with CEP 12.1. Illustrator COM `DoJavaScript` invoked the installed `host.jsx` with an actual SVG produced by the panel. The result was a 159 × 45 pt `GroupItem` containing 27 paths and equation metadata, centered at (300, 300) pt on a 600 × 600 pt artboard, with no text, raster images, or linked images.

This confirms actual panel loading and native insertion. An end-to-end click test of the panel’s insertion button and its CEP bridge was not completed because the test tool could not target controls in the CEP child window. All 16 installer tests passed under Python 3.12 and 3.14, all 11 panel checks passed under simulated Win32 and MacIntel platforms, and three package checks passed. The earlier Illustrator 30.5.1 macOS insertion result was not retested in the application for this release.
