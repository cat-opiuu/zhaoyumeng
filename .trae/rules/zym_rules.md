# ZYM 项目规则

以下规则自 2026-10-23 起生效，适用于本项目（D:\cat-css）的所有代码与操作：

## 1. 命名规范

- 所有 CSS 类名必须以 `zym_` 开头，例如 `zym_container`、`zym_nav-bar`
- 所有 id 名必须以 `zym_` 开头，例如 `zym_header`、`zym_main-content`
- 所有 JS 变量必须以 `zym_` 开头，例如 `zym_data`、`zym_currentPage`

## 2. 提示词记录规则

- 每条用户提示词在执行之前，必须先写入项目根目录的 `zym_prompt.md`
- 写入方式：**附加（append）**，不得覆盖之前的内容
- 每条记录必须包含：
  1. 时间（yyyy-MM-dd HH:mm:ss）
  2. 使用的模型名称
  3. 提示词原文内容

## 3. HTML 文件导航规则

- 所有新建的 HTML 文件必须加入返回首页 `index.html` 的超链接入口，例如：

```html
<a href="index.html">返回首页</a>
```

## 4. HTML 文件注释规范

- 所有新建的 HTML 文件必须在 `<head>` 内（`<title>` 之后）加入注释头，包含：作者、建立时间、使用大模型、功能名称，例如：

```html
<!--
  作者：赵予萌
  建立时间：yyyy-MM-dd HH:mm:ss
  使用大模型：GLM-5.3-Flash
  功能名称：XX页面
-->
```

- JS 部分的每个函数必须加上描述其主要实现功能的注释，例如：

```javascript
// 功能：筛选样张列表，按关键字隐藏不匹配的条目
function zym_filter(zym_key) { ... }
```
