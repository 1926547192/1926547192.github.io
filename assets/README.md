# assets 目录说明

把美术素材放进本目录，然后在 `js/config.js` 的 `ASSETS` 中把文件名填到对应素材键的 `src` 上。
例如拿到背景图 `bg_street.png`：

```js
'bg-street': { src: 'assets/bg_street.png', note: '……' },
```

填好后游戏内对应位置的「素材占位」虚线框会自动替换为图片（图片加载失败时自动回退为占位框）。

## 建议命名约定（可随意，保持一致即可）

```
assets/
  bg_title.png       标题背景
  bg_street.png      清晨街角
  bg_bus.png         大巴车内
  bg_tomb.png        昏暗墓室
  bg_stone.png       画像石石刻
  bg_camp.png        夜晚军营
  bg_tent.png        主营帐内
  bg_feast.png       庆功宴
  char_oldlady.png   老婆婆立绘
  char_shadow.png    失忆男子·黑影
  char_fenghuan.png  失忆男子·清晰
  char_bangu.png     班固立绘
  item_match.png     火柴
  item_torch.png     火把
  fx_lunge.png       黑影扑屏特效（可选）
  fx_war.png         战争定格（可选）
  ui_book_bg.png     证据册纹样（可选）
```

详细尺寸建议见根目录《素材清单.md》。
