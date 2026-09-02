# Nav Dashboard - 个人工作台

基于 Vue 3 + GitHub 的免费个人工作台，集成导航书签、私密记事本和资料库。公开导航页任何人可访问，记事本和资料库仅你可编辑。

## 功能

### 导航（公开）
- 分类管理：添加/编辑/删除分类，拖拽排序
- 网址管理：添加/编辑/删除网址，拖拽排序
- 标签系统：为网址添加标签，按标签筛选
- 搜索过滤：关键词搜索标题、网址、描述、标签

### 记事本（私密，仅 Owner）
- 便签模式：快速记录短文本
- 笔记模式：支持 Markdown 长文
- 分类、标签、置顶
- 自动保存到私有仓库

### 资料库（私密，仅 Owner）
- Markdown 文件管理
- 文件夹分类 + 标签
- 全文搜索
- 在线预览渲染效果

### 通用
- 主题切换：浅色/深色/跟随系统
- 自动保存：编辑后 1.5 秒自动保存到 GitHub
- 响应式布局：手机/平板/桌面自适应
- 黑白极简 UI

## 架构

```
公开仓库 nav-dashboard          私有仓库 nav-dashboard-private
── 前端应用 (Vue 3 SPA)        ├── data/notes.json
├── data/bookmarks.json         ├── knowledge/
└── GitHub Pages 托管           │   ├── index.json
                                │   └── *.md
                                └── GitHub API 读写
```

## 部署步骤

### 1. 创建 GitHub 仓库

- 创建一个**公开仓库** `nav-dashboard`（用于前端 + 书签数据）
- 创建一个**私有仓库** `nav-dashboard-private`（用于记事本 + 资料库数据）

### 2. 修改配置

编辑 `src/config.js`：

```js
export const GITHUB_OWNER = '你的用户名'
export const GITHUB_REPO = 'nav-dashboard'
export const GITHUB_BRANCH = 'main'
export const DATA_PATH = 'data/bookmarks.json'
export const OWNER_LOGIN = '你的用户名'
export const PRIVATE_REPO = 'nav-dashboard-private'
```

### 3. 创建 Fine-grained PAT

1. 打开 https://github.com/settings/tokens?type=beta
2. 点击 "Generate new token"
3. **Token name**: `nav-dashboard`
4. **Expiration**: 选择期限
5. **Repository access**: 选择 "Only select repositories" → 同时选择 `nav-dashboard` 和 `nav-dashboard-private`
6. **Permissions** → Repository permissions → **Contents** → **Read and Write**
7. 生成后复制 token（只显示一次）

### 4. 推送代码并部署

```bash
git init
git add .
git commit -m "Initial commit: nav dashboard v2"
git branch -M main
git remote add origin https://github.com/你的用户名/nav-dashboard.git
git push -u origin main
```

### 5. 启用 GitHub Pages

1. 打开 `nav-dashboard` 仓库 → **Settings** → **Pages**
2. Source 选择 **GitHub Actions**
3. 等待 Actions 运行完成
4. 访问地址：`https://你的用户名.github.io/nav-dashboard/`

### 6. 登录编辑

1. 打开导航页
2. 点击右上角 **登录**
3. 粘贴 PAT
4. 验证通过后可切换三个模块，进入编辑模式管理内容

## 技术栈

- Vue 3 + Vite + Pinia
- Tailwind CSS v4
- vue-draggable-plus (拖拽)
- marked (Markdown 渲染)
- GitHub REST API (数据存储)
- GitHub Pages (托管)
- **全部免费**
