# 数值高塔

数值高塔是一个独立前端小游戏项目。玩家从第 1 层开始，通过攻击、防御、选择奖励、积累遗物和经营金币，在 30 层高塔中形成自己的构筑，最终挑战第 30 层最终首领。

项目不依赖主站、不需要后端、不需要数据库，可以独立访问，也适合被主站 LAB 板块通过 iframe 嵌入展示。

## 技术栈

- React
- Vite
- TypeScript
- 普通 CSS
- localStorage 本地记录

## 本地运行方式

```bash
npm install
npm run dev
```

启动后按照终端提示访问本地地址。

## 构建方式

```bash
npm run build
```

构建产物会生成在 `dist/` 目录中，可以直接用于静态部署。

## 部署建议

这个项目是纯前端静态项目，适合部署到 Vercel、Cloudflare Pages、Netlify、GitHub Pages 或任意静态托管平台。

常见配置：

- 构建命令：`npm run build`
- 输出目录：`dist`
- Node.js 版本：建议使用当前长期维护版本

## iframe 嵌入示例

当前 GitHub Pages 部署地址：

```text
https://orandolee.github.io/Tower_game/
```

主站 LAB 页面可以使用下面的方式嵌入：

```html
<iframe
  src="https://orandolee.github.io/Tower_game/"
  title="数值高塔"
  style="width: 100%; min-height: 760px; border: 0; display: block;"
  allow="fullscreen"
></iframe>
```

如果嵌入区域较窄，例如移动端或 900px 宽度的 LAB 卡片，页面会自动切换为适合触屏操作的布局。页面自身提供完整背景和样式，不访问父页面 DOM，也不依赖主站 CSS 或字体。

## 项目结构说明

```text
src/
  main.tsx
  App.tsx
  styles/
    global.css
  game/
    constants.ts
    format.ts
    logic.ts
    rewards.ts
    shop.ts
    storage.ts
    types.ts
  components/
    ActionPanel.tsx
    BattleLog.tsx
    DeckList.tsx
    EnemyPanel.tsx
    GameHeader.tsx
    PlayerPanel.tsx
    RelicList.tsx
    ResultPanel.tsx
    RewardChoices.tsx
    ShopPanel.tsx
    StatItem.tsx
```

核心游戏逻辑位于 `src/game/logic.ts`、`src/game/rewards.ts` 和 `src/game/shop.ts`。页面组件位于 `src/components/`，负责展示中文界面、响应攻击、防御、奖励选择、商店购买、删牌和重新开始操作。
