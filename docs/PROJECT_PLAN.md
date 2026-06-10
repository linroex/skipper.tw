# Skipper.tw 台湾帆船活动公告栏 - 项目规划

## 一、项目概述

**项目名称**: Skipper.tw (台湾帆船活动公告栏)

**项目目标**: 建立一个纯前端的台湾帆船活动与课程资讯公告平台，让用户能够方便地查找相关活动和课程信息，不进行在线报名功能。

**技术架构**: 纯前端静态网站，部署于 GitHub Pages，使用 JSON 文件作为资料源。

---

## 二、功能规划

### 2.1 核心功能

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 活动列表展示 | 显示所有帆船活动的基本信息（名称、时间、地点、简介） | P0 |
| 课程列表展示 | 显示所有帆船课程的基本信息（课程名称、级别、时间、价格） | P0 |
| 分类筛选 | 按活动类型、地区、时间范围筛选 | P1 |
| 搜索功能 | 按名称、地点、关键字搜索 | P1 |
| 详情页面 | 点击后显示完整资讯（时间、地点详情、费用、联络方式等） | P0 |
| 响应式设计 | 支援桌面、平板、手机浏览 | P0 |

### 2.2 次要功能

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 活动/课程排序 | 按时间、热度、距离排序 | P2 |
| 地图整合 | 显示活动地点（可选，后期规划） | P2 |
| 订阅功能 | 邮件或 LINE Notify 通知新活动（需要后端服务） | P2 |
| 收藏功能 | 使用者收藏喜欢的活动（纯前端需 localStorage） | P2 |
| 分享功能 | 分享活动到社群媒体 | P1 |

---

## 三、资料结构设计

### 3.1 JSON 资料架构

#### activities.json (活动资料)
```json
{
  "activities": [
    {
      "id": 1,
      "title": "帆船初体验课程",
      "type": "workshop",
      "region": "北台湾",
      "date": "2026-07-15",
      "location": "基隆",
      "unit": "乐活",
      "price": 2500,
      "contact": "0912-345-678",
      "description": "适合初学者的帆船体验课程",
      "url": "https://example.com/activity/1"
    }
  ]
}
```

**关键字段**（10 个）：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 编号 |
| title | string | 活动名称 |
| type | string | 活动类型（workshop/race/camp） |
| region | string | 地区（北台湾/中台湾/南台湾/东台湾） |
| date | string | 活动日期（YYYY-MM-DD） |
| location | string | 活动地点 |
| unit | string | 主办单位 |
| price | number | 价格 |
| contact | string | 联络方式 |
| description | string | 活动简介 |
| url | string | 外部连结（选填） |

#### courses.json (课程资料)
```json
{
  "courses": [
    {
      "id": 1,
      "title": "帆船驾驶员初级认证课程",
      "organization": "ASA",
      "level": "beginner",
      "unit": "乐活",
      "region": "北台湾",
      "date": "2026-07-01",
      "location": "福隆",
      "price": 15000,
      "contact": "03-999-8888",
      "url": "https://example.com/course/1"
    }
  ]
}
```

**关键字段**（10 个）：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 编号 |
| title | string | 课程名称 |
| organization | string | 认证组织（ASA/IYT/TSA） |
| level | string | 课程等级（beginner/intermediate/advanced） |
| unit | string | 主办单位 |
| region | string | 地区 |
| date | string | 课程日期 |
| location | string | 地点 |
| price | number | 价格 |
| contact | string | 联络方式 |
| url | string | 外部连结（选填） |

#### regions.json (地区资料)
```json
{
  "regions": ["北台湾", "中台湾", "南台湾", "东台湾"]
}
```

#### types.json (活动类型)
```json
{
  "types": [
    {"id": "workshop", "name": "体验课程"},
    {"id": "race", "name": "帆船赛事"},
    {"id": "camp", "name": "夏令营"},
    {"id": "seminar", "name": "讲座"}
  ]
}
```

### 3.2 字段说明

**unit（主办单位）**：
- 活动：主办单位的名称
- 课程：主办单位名称

**organization（认证组织）**：
- 课程专属字段
- 例如：ASA、IYT、TSA 等帆船认证机构

**url（外部连结）**：
- 选填字段
- 连结到报名页面或官方资讯
- 若为空，则显示联络方式供使用者洽询

**region（地区）**：
- 北台湾：基隆、新北、台北、桃园、宜兰
- 中台湾：台中、苗栗、彰化
- 南台湾：台南、高雄、屏东
- 东台湾：花莲、台东

**type（活动类型）**：
- workshop：体验课程
- race：帆船赛事
- camp：夏令营
- seminar：讲座

---

## 四、技术架构

### 4.1 技术栈选择

#### 推荐方案：Vue.js 3 + Vite

| 项目 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Vue.js 3 | 轻量、易学、生态完善 |
| 构建工具 | Vite | 快速构建、热更新 |
| 样式 | Tailwind CSS | 响应式、快速开发 |
| 状态管理 | Pinia | Vue 3 推荐状态管理 |
| 路由 | Vue Router | SPA 路由 |
| HTTP 请求 | Axios | 获取 JSON 资料 |
| 图标 | Iconify | 丰富的图标库 |

#### 备选方案：React + Vite

| 项目 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18 | 主流框架、生态丰富 |
| 构建工具 | Vite | 快速构建 |
| 样式 | Tailwind CSS | 响应式 |
| 状态管理 | Zustand / Context | 轻量状态管理 |
| 路由 | React Router | SPA 路由 |
| HTTP 请求 | Axios | 获取 JSON 资料 |

### 4.2 项目目录结构

```
skipper.tw/
├── public/
│   ├── images/
│   │   ├── activities/
│   │   ├── courses/
│   │   └── icons/
│   └── data/
│       ├── activities.json
│       ├── courses.json
│       ├── regions.json
│       └── types.json
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── tailwind.css
│   ├── components/
│   │   ├── ActivityCard.vue
│   │   ├── CourseCard.vue
│   │   ├── ActivityList.vue
│   │   ├── CourseList.vue
│   │   ├── FilterBar.vue
│   │   ├── SearchBar.vue
│   │   ├── DetailModal.vue
│   │   ├── Pagination.vue
│   │   └── Footer.vue
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Activities.vue
│   │   ├── Courses.vue
│   │   ├── ActivityDetail.vue
│   │   └── CourseDetail.vue
│   ├── stores/
│   │   └── activityStore.js
│   ├── utils/
│   │   ├── formatDate.js
│   │   └── api.js
│   ├── router/
│   │   └── index.js
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
├── README.md
└── .gitignore
```

### 4.3 资料获取策略

```javascript
// src/utils/api.js
export const fetchActivities = async () => {
  const response = await fetch('/data/activities.json');
  return response.json();
};

export const fetchCourses = async () => {
  const response = await fetch('/data/courses.json');
  return response.json();
};

export const fetchRegions = async () => {
  const response = await fetch('/data/regions.json');
  return response.json();
};
```

**注意**: 资料文件直接放在 `public/data/` 目录下，通过相对路径获取，无需后端 API。

---

## 五、页面规划

### 5.1 首页 (Home)
- 轮播图/特色活动展示
- 即将开始的活动卡片
- 热门课程推荐
- 地区快速筛选
- 搜索栏

### 5.2 活动列表页 (Activities)
- 活动卡片列表
- 筛选器（地区、类型、时间、价格）
- 排序功能
- 分页/加载更多

### 5.3 课程列表页 (Courses)
- 课程卡片列表
- 筛选器（地区、级别、时间、价格）
- 排序功能
- 分页/加载更多

### 5.4 详情页 (Detail Page)
- 活动/课程完整资讯
- 时间轴/课程大纲
- 地点地图（可选）
- 联络方式
- 分享按钮

---

## 六、设计风格

### 6.1 色彩规范

```css
/* 主色调 */
--primary: #0EA5E9  /* 天空蓝 */
--secondary: #0284C7 /* 深蓝 */
--accent: #F59E0B    /* 橙色 */

/* 中性色 */
--background: #F8FAFC
--text: #1E293B
--textLight: #64748B
--border: #E2E8F0
```

### 6.2 设计原则

- 清新海洋风格
- 大留白、卡片式设计
- 清晰的层级关系
- 移动端优先

---

## 七、GitHub Pages 部署

### 7.1 部署流程

1. 创建 GitHub Repository
2. 推送代码到 `main` 或 `gh-pages` 分支
3. 在 Settings > Pages 设置部署来源
4. 配置自定义域名（可选）

### 7.2 GitHub Actions 自动化部署（可选）

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 八、开发时程规划

### 阶段一：基础架构 (1-2 天)
- [ ] 项目初始化
- [ ] 安装依赖
- [ ] 建立基本组件结构
- [ ] 配置路由

### 阶段二：核心功能 (3-5 天)
- [ ] 活动列表页面
- [ ] 课程列表页面
- [ ] 筛选/搜索功能
- [ ] 详情页

### 阶段三：优化完善 (2-3 天)
- [ ] 响应式调整
- [ ] 性能优化
- [ ] SEO 优化
- [ ] 测试

### 阶段四：部署上线 (1 天)
- [ ] GitHub 仓库建立
- [ ] 部署配置
- [ ] 域名配置
- [ ] 正式上线

**总时程**: 约 1-2 周

---

## 九、后续扩展方向

### 9.1 功能扩展
- 加入报名功能（需后端 API）
- 使用者账户系统
- 评论与评分系统
- 活动提醒通知

### 9.2 技术升级
- 整合 Google Maps API
- RSS 订阅功能
- PWA 行动网页应用
- 数据分析追踪

### 9.3 搜索能力
- 使用 `search-xng` skill 进行网络搜索
- 整合 weather API 获取海域天气
- 整合 maps API 显示活动地点

---

## 十、参考资源

- Vue.js 官方文档：https://vuejs.org/
- Vite 官方文档：https://vitejs.dev/
- Tailwind CSS 官方文档：https://tailwindcss.com/
- GitHub Pages 部署：https://pages.github.com/

---

**文档版本**: v1.0  
**建立日期**: 2026-06-09  
**维护者**: Skipper.tw 团队
