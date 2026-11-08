# Windows 安装指南

适用于 Windows 上的 Adobe Illustrator 2025–2026（29.5.1–30.x，CEP 12）。插件是未签名的 CEP 开发版，安装到当前 Windows 用户目录，无需管理员权限。

[完整使用说明](使用说明.md) · [English guide](USAGE.en.md)

## 已验证的 Windows 环境

v1.1.0 已在 Windows 11（build 22631）、Python 3.14.4、Illustrator 29.6.1 / CEP 12.1 上，从解压后的 Windows ZIP 成功安装，并实际打开扩展菜单和面板。通过 Illustrator COM 调用已安装的 `host.jsx`，导入面板生成的 SVG，成功得到 159 × 45 pt、27 条路径的矢量公式组，保留公式元数据，无文本、栅格图或链接图。

这次测试验证了真实面板加载和原生插入；面板插入按钮的完整点击流程尚未进行端到端验证。详细测试范围与自动检查结果见 [v1.1.0 验证记录](https://github.com/qiukefan/word-equation-illustrator/blob/main/docs/VALIDATION-1.1.0.md)。

## 1. 准备环境

- 已安装 Illustrator 29.5.1 或更新的 29.x，或 30.x，可在 Illustrator 的“帮助 → 关于 Illustrator”中检查版本。
- 已安装 Python 3.9 或更新版本。Python 只用于安装、卸载和从源码构建，运行插件不需要 Python。

在 PowerShell 或命令提示符中检查：

```powershell
py -3 --version
```

若没有 `py`，也可以检查 `python --version`。安装入口依次尝试 `py -3`、`python`，并检查版本。两者均不可用时，从 [Python 官方网站](https://www.python.org/downloads/windows/) 安装 Python，使 Python 启动器或 `python` 命令可用，然后重新打开终端。仅有指向 Microsoft Store 的命令别名不等于已经安装 Python。

## 2. 下载并完整解压

下载 [v1.1.0 Windows 安装包](https://github.com/qiukefan/word-equation-illustrator/releases/download/v1.1.0/WordEquationIllustrator-1.1.0-windows.zip)，在文件资源管理器中右键选择“全部解压缩”。不要直接从 ZIP 预览窗口运行安装器。

[GitHub Releases](https://github.com/qiukefan/word-equation-illustrator/releases) 按版本保留安装包；新版本请查看 [最新发布](https://github.com/qiukefan/word-equation-illustrator/releases/latest)。通用安装包 `WordEquationIllustrator-1.1.0-universal.zip` 同样可用于 Windows。

解压后，`Install.cmd`、`安装到Illustrator.cmd`、`install.py` 与 `local.word-equation.illustrator` 文件夹应位于同一目录。

如果下载的是 GitHub 的 **Code → Download ZIP** 源码包，先完整解压，在仓库目录打开 PowerShell 并运行：

```powershell
py -3 build_plugin.py
```

再运行仓库中的安装入口，或解压 `releases` 中新生成的完整安装包后安装。未安装 `py` 启动器时，可将命令中的 `py -3` 替换为指向 Python 3.9+ 的 `python`。

## 3. 安装

1. 双击 `安装到Illustrator.cmd`；英文提示入口为 `Install.cmd`。
2. 安装器会先检查插件文件及其 SHA-256 校验值。
3. 若尚未启用未签名 CEP 扩展加载，阅读提示后输入 `ENABLE` 并回车。直接回车会取消，不修改加载设置或安装文件。
4. 看到安装完成提示后，保存正在编辑的文档，自行退出并重新打开 Illustrator。
5. 打开 **窗口 → 扩展功能 → Word → LaTeX**（英文界面为 **Window → Extensions → Word → LaTeX**）。

安装器不会关闭 Illustrator，也不需要“以管理员身份运行”。文件安装到：

```text
%APPDATA%\Adobe\CEP\extensions\local.word-equation.illustrator
```

在文件资源管理器地址栏粘贴该路径即可打开。`%APPDATA%` 指当前 Windows 用户的应用数据目录。

启用未签名加载时，安装器写入当前用户注册表：

```text
HKEY_CURRENT_USER\Software\Adobe\CSXS.12
PlayerDebugMode    REG_SZ    1
```

该设置会允许当前用户的所有 CEP 12 宿主加载未签名扩展。原注册表值、原类型及安装状态保存在 `%APPDATA%\WordEquationIllustrator\install-state.json`，供卸载恢复；不要在需要恢复设置前删除这个状态文件。

## 4. 使用与检查

1. 在 Illustrator 中新建或打开文档，激活目标画板。
2. 在插件面板中输入 `x^2+y^2=z^2` 检查预览，或在 Word 中复制原生公式后，用 `Ctrl+V` 粘贴到面板输入区。也可直接导入本机 `.docx` 文件。
3. 选择字体、字号和颜色，点击“插入当前画板”。等待插入完成，期间保持当前文档和画板不变。
4. 检查公式是否位于画板中央的新“公式”图层。插入对象是可编辑的矢量路径组。
5. 如需独立文件，使用 PNG、SVG、`.tex` 或 `.md` 导出按钮，选择本机保存位置。

“读取剪贴板”按钮不可用时，直接使用 `Ctrl+V`。图片、扫描件或旧版嵌入式公式对象不能直接识别。首次 SVG 导入可能较慢。

## 5. 更新或重复安装

完整解压新安装包，重新运行 `安装到Illustrator.cmd` 或 `Install.cmd`。安装器会先将已安装的同名插件移动到：

```text
%APPDATA%\WordEquationIllustrator\Backups
```

重复安装会保留首次由安装器修改加载设置之前的原值，供以后恢复。更新后保存工作并重启 Illustrator。保留解压后的安装包，以便卸载。

## 6. 卸载与恢复加载设置

双击 `卸载插件.cmd`；英文入口为 `Uninstall.cmd`。卸载器将本插件移入备份目录，不删除其他插件。

若安装器曾开启未签名加载，且当前设置仍是安装器写入的值，卸载器会询问是否恢复。输入 `RESTORE` 恢复安装前的注册表值及类型；若原值不存在，则移除 `PlayerDebugMode` 值。直接回车保留当前设置。若其他程序在安装后修改了该设置，卸载器不会覆盖新设置。

恢复加载设置可能使其他未签名 CEP 12 插件无法加载。卸载完成后，保存工作并重启 Illustrator。

## 常见问题

| 现象 | 处理方法 |
| --- | --- |
| 提示找不到 Python 或版本过低 | 检查 `py -3 --version` 和 `python --version`，安装 Python 3.9+ 后重新运行安装入口。 |
| 提示缺少插件文件或校验失败 | 重新下载并完整解压安装包；保持安装入口、`install.py` 与插件文件夹在一起。源码包须先构建。 |
| Illustrator 没有显示面板 | 确认版本为 29.5.1 或更新的 29.x，或 30.x、安装与运行 Illustrator 使用同一 Windows 账户，保存工作后完全退出并重启；重新运行安装器检查文件与加载设置。 |
| 双击入口报错或窗口关闭 | 在解压目录打开 PowerShell，运行 `py -3 install.py`，保留报错内容。英文提示用 `py -3 install.py --language en`。 |
| “读取剪贴板”无效 | 在输入区直接 `Ctrl+V`，或本地导入 `.docx`。 |
| 插入期间提示文档或画板变化 | 回到目标文档和画板，重新点击插入；生成期间保持目标不变。 |

可用以下只读命令检查加载设置：

```powershell
reg query HKCU\Software\Adobe\CSXS.12 /v PlayerDebugMode
```

启用后应显示 `PlayerDebugMode`、`REG_SZ`、`1`。没有此值时，可重新运行安装器并按提示输入 `ENABLE`。
