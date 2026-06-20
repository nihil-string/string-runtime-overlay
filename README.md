# String 职能分配悬浮窗

## 用法

1. 在 OverlayPlugin 新建一个悬浮窗。
2. 类型选择“数据统计”或当前整合包允许加载网页的自定义悬浮窗类型。
3. 地址填写：

   ```text
   https://nihil-string.github.io/string-runtime-overlay/
   ```

4. 进入副本后检查 8 人列表；鼠标移入悬浮窗后可拖拽玩家换位，也可以点击玩家名下拉调整 `MT/ST/H1/H2/D1/D2/D3/D4`。
5. 职能变更后会自动广播；也可以点击“广播”立即同步一次。
6. “标记”开关只启用本次 ACT/悬浮窗会话的自动标点，重启或刷新后自动关闭。

## 连接状态

- `已连接`：已经连到 OverlayPlugin，进入小队/副本后会自动读取 8 人列表。
- `连接中` / `离线`：没有拿到 OverlayPlugin API，此时只显示 `MT/ST/H1/H2/D1-D4` 职能占位，不会显示演示姓名，也不会广播。

如果在 ACT 里一直是 `离线`，优先用 OverlayPlugin 的 URL Generator/WS Server 方式创建悬浮窗，确保 URL 带有 `OVERLAY_WS` 参数，或使用会注入 OverlayPlugin API 的悬浮窗类型。

## 发布范围

这个仓库只发布职能分配悬浮窗的静态文件，不包含 cactbot 触发器、ACT 日志或私有配置。

## 协议

悬浮窗通过 OverlayPlugin broadcast 发送：

```js
{
  source: 'stringRuntimeJS',
  msg: {
    autoMark: false,
    party: [
      { id: 'actor id', name: 'player name', rp: 'MT' },
    ],
  },
}
```

`[必装] 依赖 - String运行库.js` 会监听 `stringRuntimeJS`，并提供 `data.stringFL.getRpByName(data, name)` 给触发器使用。
