# String 职能与本次设置悬浮窗

## 用法

安装并启用 StringDownloader 后，OverlayPlugin 会在下次初始化时自动创建 `String 职能分配`，不需要手动新建悬浮窗。已有同名或相同地址的窗口会直接复用。

若只单独使用静态页面，也可以手动新建“数据统计”悬浮窗并填写：

   ```text
   https://nihil-string.github.io/string-runtime-overlay/
   ```

平时悬浮窗只保留 8 人职能列表；鼠标移入后展开操作区，可拖拽玩家换位，也可以点击玩家名下拉调整 `MT/ST/H1/H2/D1/D2/D3/D4`。职能变更后会自动广播，不需要手动广播。

## 绝妖星本次设置

- 点击“本次设置”时会自动扩大 OverlayPlugin 窗口，并按阶段展示完整设置；离开悬浮窗后恢复为紧凑职能列表。
- 未进入绝妖星时也可以预先修改、保存和切换配置档案；进入绝妖星（Zone 1363）后自动载入当前档案并切到“本次设置”。
- 配置档案位于阶段选择上方，代表整本 P1-P5 的完整设置；可以命名保存并从下拉框选择。
- P1-P5 使用横向阶段栏切换，只展示当前阶段的设置。
- P5 可以分别设置连续地火预显数量、MuAi 两步法地火个人路线、是否启用遗弃末世个人引导，以及从第几轮开始引导；关闭地火个人路线不隐藏危险圆，个人引导仍同时受原生绘图总开关、P5 阶段开关和个人引导总开关约束。
- 修改会自动记忆到当前配置档案；“应用本次”只在绝妖星内且未进入战斗时可用。
- “恢复默认”会重置当前档案；自动标点和各阶段标点的默认值仍为关闭。
- 战斗开始后配置锁定，脱战后可以再次修改。
- 配置由 StringDownloader 的 `stringConfig` handler 保存；桥接不可用时触发器继续使用默认值。

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
    party: [
      { id: 'actor id', name: 'player name', rp: 'MT' },
    ],
  },
}
```

`[必装] 依赖 - String运行库.js` 会监听 `stringRuntimeJS`，并提供 `data.stringFL.getRpByName(data, name)` 给触发器使用。
