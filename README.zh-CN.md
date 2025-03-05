# DHConsole

[English](./README.md) | 中文

一个用于通过 UI 控制丹恒服务器的本地网页应用，支持12种语言。

访问 https://anyrainel.github.io/DHConsole/ 使用最新版本。

## 功能特性

- [x] 角色管理（修改属性、光锥、遗器等）
- [x] 遗器管理（选择词条和升级，或让 DHConsole 为您推荐）
- [x] 任务管理（选择要跳过的任务）
- [x] 场景管理（解锁场景中的道具，作为未实现功能的临时解决方案）
- [x] 背包管理（向背包添加更多物品）
- [x] 账号等级、性别和其他控制（例如解锁所有内容）
- [x] 指定命令

![功能展示](./docs/features.gif)

### 多语言支持支持
![介绍](./docs/intro.gif)

### 深色/浅色主题
![浅色主题](./docs/lightcolor.gif)

## 使用方法

### 前置要求

- 从 [DanhengPlugin-DHConsoleCommands](https://github.com/Anyrainel/DanhengPlugin-DHConsoleCommands) 下载插件 dll 文件。
- 将 dll 文件放置在丹恒服务器的 `Plugins` 文件夹中。

### 方式一：使用 GitHub Pages

- 在浏览器中打开 [DHConsole](https://anyrainel.github.io/DHConsole/)。

### 方式二：克隆并通过 npm 运行

```bash
git clone https://github.com/Anyrainel/DHConsole.git --depth 1
cd DHConsole
npm install
npm run dev
```

然后打开终端输出中显示的 URL。

### 使用提示

记得在打开页面后点击"连接"按钮。您需要从私服中找到 `config.json` 文件来初始化连接。

与丹恒服务器的连接有时可能不稳定，如果连接断开，您可能需要重新连接。

## 问题反馈
请在此仓库中提出新的 Issue。 