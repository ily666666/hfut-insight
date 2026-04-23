# yijian-capture 一见页面采集工具

用来在本地打开百度一见的监控中心摄像头页面，由你自己登录，脚本自动保存渲染后的
DOM、截图、生效样式，供后续页面仿真参考。

## 使用方法

打开 PowerShell 并进入本目录：

```powershell
cd E:\coderepository\hfut-insight\tools\capture
```

第一次运行前，安装依赖和浏览器内核：

```powershell
npm install
npx playwright install chromium
```

运行脚本：

```powershell
npm run capture
```

脚本会：

1. 自动弹出一个可见的 Chromium 浏览器窗口；
2. 打开 `https://yijian-next.cloud.baidu.com/app/app/monitor/center/camera`；
3. 在登录页停下来，**你用自己的账号手动登录**（脚本不会记录密码）；
4. 登录成功、摄像头页面加载完成之后，回到终端按回车；
5. 脚本会在 `output/` 目录写入：
   - `camera.html` —— 渲染后的完整 DOM；
   - `camera-viewport.png` —— 当前视口截图；
   - `camera-fullpage.png` —— 整页截图；
   - `camera-styles.css` —— 页面生效样式（尽力而为）。

完成后把这些文件提供给我即可。

## 安全说明

- 所有操作都在你本地电脑上进行，账号密码**不会经过网络发送给任何第三方**；
- 脚本内只硬编码了目标 URL，没有保存或上传任何凭据；
- 采集完的截图 / DOM 里可能包含你账号里的真实数据，如果有敏感信息，
  可以先在浏览器里手动隐藏再截图，或者截图后用画图软件涂掉再发给我。
