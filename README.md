# String 职能分配悬浮窗

## 用法

1. 在 OverlayPlugin 新建一个悬浮窗。
2. 类型选择“数据统计”或当前整合包允许加载网页的自定义悬浮窗类型。
3. 地址填写：

   ```text
   https://mulongsheng.github.io/string-runtime-overlay/
   ```

4. 进入副本后检查 8 人列表；鼠标移入悬浮窗后可拖拽玩家换位，也可以点击玩家名下拉调整 `MT/ST/H1/H2/D1/D2/D3/D4`。
5. 点击“广播”，或打开“自动广播”。

## 发布范围

这个仓库只发布职能分配悬浮窗的静态文件，不包含 cactbot 触发器、ACT 日志或私有配置。

## 协议

悬浮窗通过 OverlayPlugin broadcast 发送：

```js
{
  source: 'stringRuntimeJS',
  msg: {
    party: [
      { id: 'actor id', name: 'player name', rp: 'MT' },
    ],
  },
}
```

`[必装] 依赖 - String运行库.js` 会监听 `stringRuntimeJS`，并提供 `data.stringFL.getRpByName(data, name)` 给触发器使用。
