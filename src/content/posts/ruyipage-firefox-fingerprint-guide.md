---
title: ruyiPage 反检测浏览器实战：Firefox 指纹内核与 fpfile 完全指南
published: 2026-10-10
description: 'ruyiPage（ruyipagedeke）完整使用指南：Firefox 指纹内核安装、quick_start 一键启动、fpfile.txt 指纹字段详解、smart_fingerprint 智能指纹、bezier/windmouse 拟人轨迹、SOCKS5 认证陷阱与 per-tab 代理轮换，附可直接复用的代码。'
image: ''
tags: [逆向, 反检测, 指纹浏览器, ruyiPage, 自动化]
category: '技术'
draft: false
lang: ''
---

## 前言

用 Playwright / Selenium 直连做自动化，第一道墙从来不是验证码本身，而是**「你根本没被当成浏览器」**。

同样一个滑块、同样一次点击，真实用户通过，脚本被秒拒——差别不在结果，在过程。服务端看的是一整条证据链：`navigator.webdriver` 有没有暴露、WebGL 报的是哪块显卡、Canvas 渲染有没有噪声、时区跟出口 IP 对不对得上、鼠标是贝塞尔曲线还是瞬移。

**ruyiPage**（仓库 `LoseNine/ruyipagedeke`）是这条路上一个值得单独讲的方案：它不走 Chromium/Playwright 那条路，而是基于 **firefox-fingerprintBrowser** 定制内核，用一份声明式的 `fpfile.txt` 描述整套指纹，指纹在 **C++ 原生 getter 层**改写，而不是靠 JS 注入打补丁。

这个区别很关键：JS 注入的补丁可以被 `Object.getOwnPropertyDescriptor` 反查出来，原生 getter 层改写则不会留下可检测的包装痕迹。

> 本文只讲工具怎么用。文中域名、端口、密钥、路径全部为占位符。

---

## 一、安装

```bash
pip install ruyipage

# 安装配套的 Firefox 内核（不是系统 Firefox，是定制内核）
python -m ruyipage install

# 查看内核装在哪了
python -m ruyipage path
```

内核默认落在：

```
Windows:  %LOCALAPPDATA%\ruyipage\browsers\<版本>\firefox\firefox.exe
Linux:    ~/.local/share/ruyipage/browsers/<版本>/firefox/firefox
```

### 1.1 浏览器路径的解析顺序

不用手动找路径，`resolve_firefox_path()` 会按固定优先级探测：

```
1. 显式传入的路径              set_browser_path(r"...")
2. 环境变量                    RUYIPAGE_FIREFOX_EXECUTABLE_PATH
                              RUYIPAGE_BROWSER_PATH
3. ruyipage 托管内核            python -m ruyipage install 装的那份
4. 系统 Firefox 兜底            C:\Program Files\Mozilla Firefox\firefox.exe
```

生产环境建议**显式指定**第 1 项或第 2 项——第 3、4 项在升级、多版本并存时行为不确定。

极端情况下（比如注册机打包进 Electron 分发）可以自己 glob 探测，新版本优先：

```python
import glob, os

def find_firefox():
    candidates = glob.glob(os.path.expandvars(
        r"%LOCALAPPDATA%\ruyipage\browsers\*\firefox\firefox.exe"))
    candidates += [
        os.path.expandvars(r"%ProgramFiles%\Mozilla Firefox\firefox.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe"),
    ]
    for path in sorted(candidates, reverse=True):   # 新版本优先
        if os.path.exists(path):
            return path
    return None
```

---

## 二、快速开始

### 2.1 最小可运行

```python
from ruyipage import FirefoxOptions, FirefoxPage

opts = FirefoxOptions()
opts.set_browser_path(find_firefox())

page = FirefoxPage(opts)
page.get("https://example.com")
print(page.title)
page.quit()
```

### 2.2 一键预设：quick_start

参数多的时候用 `quick_start()` 一次配齐，省掉十几行链式调用：

```python
opts = FirefoxOptions().set_port(9222).quick_start(
    browser_path=r"D:\FirefoxPortable\firefox.exe",
    user_dir=r"D:\my_firefox_userdir",
    proxy="socks5://127.0.0.1:1080",
    fpfile=r"D:\my_firefox_userdir\fpfile.txt",
    headless=False,
    private=False,
    human_algorithm="bezier",
    window_size=(1280, 800),
    xpath_picker=False,
    action_visual=False,
    trace=False,
    failure_snapshot=False,
    timeout_base=10,
    timeout_page_load=30,
    timeout_script=30,
)

page = FirefoxPage(opts)
```

| 参数 | 作用 |
| --- | --- |
| `browser_path` | Firefox 可执行文件路径 |
| `user_dir` | profile 目录，复用它就能复用登录态 / Cookie |
| `proxy` | `http://ip:port` 或 `socks5://ip:port` |
| `fpfile` | 指纹配置文件路径 |
| `private` | Firefox 原生私密模式（启动加 `-private`） |
| `headless` | 无头开关 |
| `human_algorithm` | 拟人轨迹算法：`"bezier"` / `"windmouse"` |
| `xpath_picker` | 页面里弹 XPath 选择浮窗，调试定位用 |
| `action_visual` | 鼠标行为可视化——看轨迹到底长什么样 |
| `trace` | BiDi 命令 / 事件环形缓冲记录 |
| `failure_snapshot` | 失败时自动截图 + 存 DOM |
| `marionette` | Marionette 通道，默认 `True` |
| `allow_system_access` | 是否允许访问特权上下文；`None` = 仅 Windows 提权会话自动开 |

**`marionette` 这一项要留意**：默认开启以兼容历史行为，但某些 Firefox 版本 / 指纹内核 / 机器环境带 `--marionette` 启动会**直接闪退**，表现为后续 BiDi 端口连不上。遇到「启动后立刻断开」先试 `marionette=False`。

**`allow_system_access` 是三元值**：`None` 表示「只在 Windows 提权会话中自动启用」，`True`/`False` 是显式覆盖。这一项存在的原因挺实际——提权环境下 Firefox 155 有连接问题，但又不能无条件放大 Remote Agent 权限，所以做成条件启用。

---

## 三、核心机制：fpfile.txt

这是 ruyiPage 与 Chromium 系反检测工具最大的区别。整套指纹写在一个文本文件里，格式是 **`key:value`**（注意不是 `=`），UTF-8 + `\n` 行尾。

### 3.1 完整字段结构

```ini
# ── 网络与地理自洽 ──
timezone:America/Denver
language:en-US
geolocation.enabled:true
geolocation.latitude:39.7392
geolocation.longitude:-104.9903
geolocation.accuracy:15000
geolocation.altitude:
geolocation.altitudeAccuracy:
geolocation.heading:
geolocation.speed:
geolocation.timestamp:now
geolocation.permission:granted

# ── 语音合成列表（检测「语音数组是否为空」的经典项）──
speech.voices.local:Microsoft David - English (United States)|Microsoft Zira - English (United States)
speech.voices.remote:Google US English
speech.voices.local.langs:en-US|en-US
speech.voices.remote.langs:en-US
speech.voices.default.name:Microsoft David - English (United States)
speech.voices.default.lang:en-US

# ── 硬件与 UA ──
font_system:windows
useragent:Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:155.0) Gecko/20100101 Firefox/155.0
hardwareConcurrency:24

# ── WebGL（必须成套，见 3.3）──
webgl.vendor:Mozilla
webgl.renderer:
webgl.version:WebGL 1.0
webgl.glsl_version:WebGL GLSL ES 1.0
webgl.unmasked_vendor:Google Inc. (NVIDIA)
webgl.unmasked_renderer:ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0), or similar
webgl.max_texture_size:16384
webgl.max_cube_map_texture_size:16384
webgl.max_texture_image_units:16
webgl.max_vertex_attribs:16
webgl.aliased_point_size_max:1024
webgl.max_viewport_dim:32767

# ── Canvas / Audio 噪声（按种子生成，同种子同结果）──
canvas.mode:pixel
canvas.seed:17592186044416
canvas.strength:low
canvas.preserveAlpha:true
canvas.preserveWhitePoint:true
canvas.pngMetadata:false
audio.seed:8796093022208

# ── WebRTC 防泄漏（走代理时必写）──
webrtc.ice_proxy_only:true

# ── 代理认证（按协议选命名空间，见第七节）──
httpauth.host:gate.example.com
httpauth.port:1000
httpauth.username:user
httpauth.password:pass
```

### 3.2 `navigator.webdriver` 根本不用写

这是最容易误解的一条：**fpfile 里没有 `webdriver` 这个键**。

内核在 C++ 原生 getter 层把 `navigator.webdriver` 硬编码成 `false`，写进 fpfile 也是 never-read 的死键，等于 no-op。所以别去翻「webdriver 该填什么」——它压根不吃这个配置。

### 3.3 WebGL 必须成套配置

**部分伪造比完全不伪造更危险。**

假设你只改了 `webgl.unmasked_renderer`，报自己是 RTX 4090，却漏了 `max_texture_size` 之类的上限值——那么检测方拿到的画面是：一个自称 4090 的设备，纹理上限却是集显水平。**这比老老实实报集显更可疑**，因为它证明有人在说谎。

所以内核的字段设计是「一个显卡档案 1:1 映射」，而不是散装开关：

```json
{
  "id": "win-rtx4090",
  "platform": "windows",
  "os_token": "Windows NT 10.0; Win64; x64",
  "font_system": "windows",
  "hardwareConcurrency": 24,
  "width": 2560,
  "height": 1440,
  "webgl": {
    "unmasked_vendor": "Google Inc. (NVIDIA)",
    "unmasked_renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0), or similar"
  }
}
```

配套的 `webgl_common` 段（全局共享，不随显卡变）包含完整的 WebGL 1.0 / 2.0 参数与扩展列表：

```json
{
  "vendor": "Mozilla",
  "version": "WebGL 1.0",
  "glsl_version": "WebGL GLSL ES 1.0",
  "webgl2_version": "WebGL 2.0",
  "webgl2_glsl_version": "WebGL GLSL ES 3.00",
  "supported_extensions": "ANGLE_instanced_arrays,EXT_blend_minmax,EXT_color_buffer_half_float,..."
}
```

### 3.4 Canvas 用种子而不是随机

```ini
canvas.mode:pixel
canvas.seed:17592186044416
canvas.strength:low
```

种子必须落在 `[1, 2^64-1]` 区间，写入前会校验：

```python
def _validate_seed(name, value):
    if isinstance(value, bool) or not isinstance(value, int) or not (1 <= value < (1 << 64)):
        raise FingerprintError("{} must be an integer in [1, 2**64 - 1]".format(name))
    return value
```

**为什么用种子而不是每次随机噪声**：真实设备的 Canvas 渲染结果在同一台机器上是**稳定的**，跨会话一致。如果每次访问都返回不同的噪声，等于告诉服务端「我这个 Canvas 指纹每次都在变」——这在真实硬件上不可能发生，反而是异常信号。

同一种子 → 同一渲染结果，跨会话稳定，这才像一个真机。

### 3.5 WebRTC：最容易漏掉的一条

```ini
webrtc.ice_proxy_only:true
```

不写这一行，**STUN 会绕过代理去探测**，srflx 候选直接把你的**真实出口 IP** 暴露给页面——前面所有代理配置一次归零。

有代理时这一项默认写 `true`，但如果你手工拼 fpfile，很容易忘。同一组还有四个可选的精确控制项：

```ini
local_webrtc_ipv4:10.0.0.5          # 主机 ICE 地址，精确白名单
local_webrtc_ipv6:
public_webrtc_ipv4:203.0.113.7      # srflx / prflx 地址
public_webrtc_ipv6:
```

默认全部省略，走原生 ICE + `ice_proxy_only` 钉住代理这条路就够了。

### 3.6 写入是原子的

这一层实现在库内部，但值得知道为什么：

```python
def _atomic_write_text(path, content):
    """tmp + os.replace + fsync"""
    parent = os.path.dirname(os.path.abspath(path)) or "."
    fd, tmp = tempfile.mkstemp(prefix=".fpfile.", suffix=".tmp", dir=parent)
    with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
        f.flush()
        try:
            os.fsync(f.fileno())
        except OSError:
            pass
    os.replace(tmp, path)
```

**为什么必须原子**：Firefox 启动时读 fpfile，如果读到写了一半的文件，指纹会**静默降级成真机硬件**——没有任何报错，只是整个反检测失效了。这是最难排查的一类故障，原子写从根上避免它。

---

## 四、智能指纹：smart_fingerprint

手工填 fpfile 不现实。`opts.smart_fingerprint()` 把整条链路自动化：

```python
opts = FirefoxOptions().set_port(9222)
opts.set_browser_path(r"C:/Program Files/Mozilla Firefox/firefox.exe")

ctx = opts.smart_fingerprint(
    proxy_host="proxy.example.com",
    proxy_port=8080,
    proxy_user="user",
    proxy_pwd="pass",
    require_country="US",
    logger=print,
)

page = FirefoxPage(opts)
ctx.apply_emulation(page)          # BiDi 层再盖一层保险
```

### 4.1 内部流水线

```
1. 探测出口 IP 归属地 ── 10 个数据源依次回退
                          (geojs / ipapi / ipwho / ip-api / ipinfo / ...)
2. 校验国家码 ────────── require_country 不匹配 → CountryMismatchError
3. 采样硬件档案 ──────── 22 套 Windows 真机配置中随机取一
4. 生成 UA ──────────── Firefox 主版本号与实际二进制对齐
5. 生成种子 ──────────── Canvas / Audio 每会话独立
6. 写入 fpfile.txt ───── 严格字段顺序，diff 友好
7. 配置 FirefoxOptions ─ 代理 / userdir / fpfile / about:blank 启动页
```

### 4.2 第 3 步：22 套硬件档案

覆盖主流独显与集显，全部是 Windows 真机配置：

```
NVIDIA:  win-rtx4090 / 4080 / 4070 / 4060 / 3070 / 3060 / 3050 / 2060
         win-gtx1660s / 1650
AMD:     win-rx7900xt / 7800xt / 7600 / 6700xt / 6600 / 580
Intel:   win-uhd770 / uhd630 / iris-xe / arc-a380 / a750 / hd4600
```

随机抽取而不是固定一个，是为了让多个并发会话不共享同一套硬件特征。

### 4.3 第 1 步：国家校验的防呆

```python
COUNTRY_MISMATCH_QUORUM = 2   # 至少两个独立源一致才判「位置不对」
```

**为什么需要 quorum**：单个 geo 服务抽风是常事。如果一源误报就直接判失败，你会白白丢掉一个干净 IP。要求两个以上独立数据源一致认定「不在目标国家」才抛错，显著降低误杀。

需要固定出口位置时：

```python
ctx = opts.smart_fingerprint(
    proxy_host="gate.example.com", proxy_port=1000,
    require_country="US",          # 出口不在美国 → 直接抛错
    logger=print,
)
```

捕获异常：

```python
from ruyipage import CountryMismatchError, GeoError

try:
    ctx = opts.smart_fingerprint(proxy_host=..., require_country="US")
except CountryMismatchError as e:
    print(f"国家不符: 实际 {e.actual} != 要求 {e.required}")
except GeoError as e:
    print(f"所有 geo 源都失败: {e}")
```

`GeoError` 的 message 里带**十个源各自的失败摘要**，所以能分辨是网络问题、限流还是解析错误。

### 4.4 离线兜底：manual_geo

十个在线源全挂时（内网、被墙、代理屏蔽 geo 服务），用 `manual_geo` 继续跑：

```python
ctx = opts.smart_fingerprint(
    proxy_host="proxy.example.com", proxy_port=8080,
    manual_geo={
        "ip": "75.166.187.10",
        "country_code": "US",
        "timezone": "America/Denver",
        "latitude": 39.7392,
        "longitude": -104.9903,
    },
    logger=print,
)
```

必需字段：`ip` / `country_code` / `timezone` / `latitude` / `longitude`。可选：`country` / `region` / `city` / `ipv6`。

**注意优先级**：在线 geo 成功时**优先用在线结果**，`manual_geo` 只是全部失败后的兜底。想强制指定就得断网或用 `coerce_manual_geo()` 单独构造。

### 4.5 智能指纹不覆盖的字段

内核支持但 `smart_fingerprint` 不自动填的项，通过 `extra` 追加：

```python
ctx = opts.smart_fingerprint(
    proxy_host=..., proxy_port=...,
    require_country="US",
    profile_id="win-rtx4090",        # 钉死档案，否则 extra 里的宽高对不上
    extra={
        "touch.maxTouchPoints": "5",
        "fonts.whitelist": "Arial|Segoe UI|Microsoft YaHei",
        "width": "2560",
        "height": "1440",
        "screen.devicePixelRatio": "1.25",
        "media.devices": "audioinput:1|videoinput:1|audiooutput:1",
    },
)
```

不覆盖的完整清单：`touch.maxTouchPoints`、`fonts.whitelist`、`width` / `height`、`screen.devicePixelRatio`、`media.devices`、其余 `webgl.*` / `webgl2.*`、`webgpu.*`。

**`profile_id` 不能省**：不指定档案的话，「用哪块显卡」是随机抽的，你写死的 `width: 2560` 可能配到一个 1080p 的档案上——自相矛盾。要么钉死档案，要么不加宽高。

`extra` 里**不能覆盖保留键**，会直接抛 `FingerprintError`。保留键包括 `timezone` / `language` / `useragent` / `hardwareConcurrency` / 所有 `webgl.*` / 所有 `speech.voices.*` / 所有 `canvas.*` / 所有 `geolocation.*` 等。

### 4.6 纵深防御：apply_emulation

内核指纹是第一层，BiDi 仿真覆盖是第二层：

```python
result = ctx.apply_emulation(
    page,
    set_screen_size=True,
    set_geolocation=True,
    set_locale=True,
    set_timezone=True,
    set_extra_headers=True,
)
# {'screen': True, 'geolocation': True, 'locale': True, 'timezone': True, 'headers': True}
```

**为什么需要两层**：内核指纹写的是底层值，但如果某个检测向量内核字段没覆盖到，BiDi 层的 `set_*` 会补上。每个子调用独立 `try/except`，版本不匹配时降级而不是崩。

异步页面用 `await ctx.apply_emulation_async(page)`。

注意 `set_screen_size` 对应的是 `emulation.set_screen_size(w, h)`，**不代表外层窗口尺寸**。`set_window_size_on_opts` 已废弃并被忽略——要设窗口大小得显式调 `opts.set_window_size()`。

---

## 五、拟人交互

### 5.1 轨迹算法

```python
opts.set_human_algorithm("bezier")     # 默认：贝塞尔，轨迹平滑，支持 style 变体
opts.set_human_algorithm("windmouse")  # 风力 + 重力拖拽，路径更飘逸
```

| 算法 | 特点 | 适用 |
| --- | --- | --- |
| `bezier` | 平滑、可控、支持变形 | 默认首选，绝大多数场景 |
| `windmouse` | 模拟风+重力，路径不规则 | 需要更强随机性的场景 |

两个都实现成 `page.mouse.*` 的底层——也就是**页面级点击自动带轨迹**，不需要每次手工构造路径。

### 5.2 拖拽：drag_to

滑块类验证码的核心操作，实现走 **W3C WebDriver BiDi `input.performActions`**，也就是**原生事件**（`isTrusted=true`），而不是 `dispatchEvent` 合成事件。

```python
handle = page.ele("#slider-handle")
handle.drag_to({"x": 300, "y": 450}, duration=1.2)
```

支持的三种目标形式：

```python
handle.drag_to(target_element)                      # 拖到元素中心（自动滚动）
handle.drag_to({"x": 300, "y": 450}, duration=1.0)  # 视口绝对坐标
handle.drag_to((300, 450), duration=1.0)            # 同上，元组形式
```

内部动作序列（所有 `pointerMove` 用 `origin="viewport"` 保证坐标绝对精确）：

```
pointerMove(sx, sy, duration=0)     # 先移到起点
pointerDown(button=0)
pause(80ms)                          # ⚠️ 起手停顿——真人按下不会立刻移动
pointerMove × N                      # 分段匀速，steps = clamp(total_ms // 30, 8, 30)
pause(80ms)                          # ⚠️ 释放前停顿
pointerUp(button=0)
```

两个 80ms 的 pause 是有意为之：人类按下鼠标后有反应延迟，松开前也有。全程零延迟的完美拖拽是最明显的机器特征。

**`duration` 参数的含义**：拖拽动画总时长（秒），越大越平滑。太短（< 0.3）会退化成近似瞬移，建议滑块场景用 `1.0` 以上。

### 5.3 触屏兜底

移动端指纹的场景需要触摸事件支持：

```python
opts.set_touch_fallback(enabled=True, max_touch_points=5, profile="mobile")
```

配套 API：`opts.can_install_touch_fallback()` 检查是否可用（要求非 `existing_only` 且有 profile 路径），`page.touch()` 拿触摸动作对象。

---

## 六、元素定位与操作

### 6.1 定位语法

```python
page.ele("#phone")                        # CSS
page.ele("//button[@type='submit']")      # XPath
page.ele("text=获取验证码")               # 文本（支持模糊）
page.ele("css:#aliyunCaptcha-checkbox-left")
page.eles("css:button")                   # 复数 → list
```

`ele()` 返回 `FirefoxElement` 或 `NoneElement`（不存在的元素是一个**空对象**而不是 `None`），所以链式调用不会崩：

```python
# 不会抛 AttributeError
text = page.ele("#may-not-exist").text or ""
```

### 6.2 常用操作

```python
ele.click_self()                  # 点击自己（滚动到视口内再点）
ele.click()                       # 返回 Clicker，可配更多参数
ele.input("13800138000")          # 输入（默认先清空）
ele.clear()
ele.hover()
ele.double_click()
ele.right_click()
ele.drag_to(target, duration=1.0)
ele.run_js("(e) => e.textContent")
ele.screenshot(path="ele.png")
```

### 6.3 属性读取

```python
ele.tag              # 标签名
ele.text             # 文本
ele.value            # value 属性（输入框）
ele.attrs            # 全部属性 dict
ele.link             # href
ele.src
ele.is_displayed     # 是否可见
ele.is_enabled
ele.is_checked
ele.size             # {'width':..., 'height':...}
ele.location         # {'x':..., 'y':...}
ele.rect             # ElementRect 对象
ele.style("color")   # 计算样式
```

### 6.4 相对定位

```python
ele.parent()                    # 父元素
ele.child("tag:input")          # 子元素
ele.children()                  # 全部子元素
ele.next()                      # 下一个兄弟
ele.prev()                      # 上一个兄弟
ele.ele("css:.inner")           # 内部查找
ele.eles("css:li")
```

### 6.5 Shadow DOM

处理 Web Components 里的元素：

```python
ele.shadow_root                 # 开放的 shadow root
ele.closed_shadow_root          # 闭合的（内核能穿透）
ele.with_shadow("open")         # 指定模式
page.shadow_roots(mode="all", include_frames=True)
```

### 6.6 页面级 API

```python
page.get(url)                    # 导航
page.title / page.url / page.html
page.user_agent
page.ready_state
page.cookies                     # 读全部
page.get_cookies_filtered(name="session", domain="example.com")
page.set_cookies([...])
page.delete_cookies(name="tracking")
page.refresh(ignore_cache=True)
page.back() / page.forward()
page.wait_loading(timeout=30)
page.screenshot(path="shot.png", full_page=True)
page.save(path="page.html")      # 存页面，as_pdf=True 存 PDF
page.run_js("() => window.__ready")
page.run_js_loaded("() => document.readyState")
```

### 6.7 多标签

```python
tab = page.new_tab(url="https://example.com")
page.tabs_count
page.tab_ids
tabs = page.get_tabs(title="Login")
page.close_other_tabs()
page.quit(timeout=5, force=False)
```

---

## 七、代理配置

### 7.1 凭据命名空间陷阱

这是**只在 SOCKS5 下才会炸**的一个坑，也是排查起来最费时的一个：**HTTP 代理和 SOCKS5 代理的账密在 fpfile 里是不同的键**。

```ini
# HTTP 代理 —— httpauth.*
httpauth.host:gate.example.com
httpauth.port:1000
httpauth.username:user
httpauth.password:pass
```

```ini
# SOCKS5 代理 —— socksauth.*，写在 httpauth 下无效
socksauth.host:gate.example.com
socksauth.port:1000
socksauth.username:user
socksauth.password:pass
```

**后果**：把 SOCKS5 的账密写进 `httpauth.*`，Firefox 拿不到可用凭据，会**弹出一个原生的用户名/密码对话框**——自动化流程就此卡死在无人值守的机器上，而且日志里什么都没有。

库内部会读回 fpfile 校验（`_read_httpauth_from_fpfile` / `_read_socksauth_from_fpfile`），所以走 API 配置时它自己会选对命名空间。**手工拼 fpfile 时务必注意**。

### 7.2 设置代理

```python
opts.set_proxy("http://127.0.0.1:7890")
opts.set_proxy("socks5://user:pass@gate.example.com:1000")
```

代理是**按实例**的。多开时每个 `FirefoxOptions` 各配各的：

```python
for proxy in proxy_list:
    opts = FirefoxOptions().set_port(0)
    opts.quick_start(proxy=proxy, headless=False)
    page = FirefoxPage(opts)
    ...
```

### 7.3 每标签页代理轮换

这是 ruyiPage 的一个特色能力：**同一个浏览器实例内，不同 tab 走不同代理**。底层依赖定制内核读 `proxy.rotate.*` 配置，按 container tab 的 `userContextId` 分配。

```python
opts.set_per_tab_proxies([
    "host1:1080:user1:pass1",
    "socks5://host2:1080:user2:pass2",
    "host3:1080:user3:pass3",
], exhausted="wrap")

# 新手友好别名
opts.set_proxy_rotate([...])
```

代理项支持两种格式：

```
"host:port:username:password"
"socks5://host:port:username:password"
```

**耗尽策略 `exhausted`**：

| 值 | 行为 |
| --- | --- |
| `wrap` | 用完后从头循环（默认） |
| `direct` | 用完后直连 |
| `none` | 不再分配代理 |
| `stop` | 停止 |

配合 container tab 使用——每个 tab 独立 Cookie / 存储，加上独立代理，等于一个实例里的多个隔离身份：

```python
tab1 = page.new_container_tab(url="https://example.com")
tabs = page.new_container_tabs(5, url="https://example.com")
```

### 7.4 geoip 与代理自洽

代理 IP 和时区必须自洽——这是风控最常查的交叉验证项。`smart_fingerprint` 会自动做：

```python
ctx = opts.smart_fingerprint(
    proxy_host="gate.example.com", proxy_port=1000,
    proxy_user="user", proxy_pwd="pass",
    require_country="US",
    logger=print,
)
```

它探测代理出口 IP → 反查归属地 → 映射到语言 / Accept-Language / 语音包 / 时区，全部写进 fpfile。

---

## 八、完整实战模板

把上面的东西拼成一个可复用的启动函数：

```python
import glob, os, logging
from ruyipage import (
    FirefoxOptions, FirefoxPage,
    apply_smart_fingerprint, CountryMismatchError, GeoError,
)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("auto")


def find_firefox():
    candidates = glob.glob(os.path.expandvars(
        r"%LOCALAPPDATA%\ruyipage\browsers\*\firefox\firefox.exe"))
    for path in sorted(candidates, reverse=True):
        if os.path.exists(path):
            return path
    return None


def launch(proxy_host=None, proxy_port=None, proxy_user=None, proxy_pwd=None,
           require_country="US", user_dir=None, headless=False,
           human_algorithm="bezier"):
    """启动一个带完整指纹的 Firefox 实例。"""
    opts = FirefoxOptions()
    opts.set_browser_path(find_firefox())
    opts.quick_start(
        headless=headless,
        human_algorithm=human_algorithm,
        window_size=(1920, 1080),
        timeout_page_load=45,
        failure_snapshot=True,          # 失败自动截图，排查利器
        snapshot_dir="./snapshots",
    )

    ctx = None
    if proxy_host:
        try:
            ctx = opts.smart_fingerprint(
                proxy_scheme="socks5",
                proxy_host=proxy_host, proxy_port=proxy_port,
                proxy_user=proxy_user, proxy_pwd=proxy_pwd,
                require_country=require_country,
                userdir=user_dir,
                logger=log.info,
            )
            log.info("指纹: %s", ctx.summary())
        except CountryMismatchError as e:
            raise RuntimeError(f"代理位置不符: {e.actual} != {e.required}") from e
        except GeoError as e:
            log.warning("geo 全部失败，改用 manual_geo: %s", e)
            ctx = opts.smart_fingerprint(
                proxy_host=proxy_host, proxy_port=proxy_port,
                proxy_user=proxy_user, proxy_pwd=proxy_pwd,
                manual_geo={
                    "ip": "0.0.0.0",
                    "country_code": require_country,
                    "timezone": "America/Denver",
                    "latitude": 39.7392,
                    "longitude": -104.9903,
                },
                logger=log.info,
            )

    page = FirefoxPage(opts)
    if ctx:
        ctx.apply_emulation(page)       # BiDi 纵深防御层
    return page, ctx


def send_code(phone: str):
    """示例：打开登录页 → 填号 → 勾协议 → 点发送。"""
    page, ctx = launch(
        proxy_host="gate.example.com", proxy_port=1000,
        proxy_user="user", proxy_pwd="pass",
    )
    try:
        page.get("https://example.com/login")

        page.ele("#phone").input(phone)
        page.run_js(
            "() => { const cb = document.querySelector('input[type=\"checkbox\"]');"
            " if (cb && !cb.checked) cb.click(); }"
        )
        page.ele("text=获取验证码").click_self()

        # 轮询按钮状态：进入倒计时 = 发送成功
        import time
        deadline = time.time() + 90
        while time.time() < deadline:
            for b in page.eles("css:button"):
                t = (b.text or "").strip()
                if "重新" in t or (t and any(c.isdigit() for c in t) and len(t) < 10):
                    log.info("发码成功: %s", t)
                    return True
            time.sleep(2)
        return False
    finally:
        page.quit()
```

---

## 九、调试工具

反检测出问题时，光看日志基本没线索。ruyiPage 内置了几个专治这个的工具。

### 9.1 trace：BiDi 全量记录

```python
opts.enable_trace(True)

page = FirefoxPage(opts)
page.get("https://example.com")
# ... 操作 ...

print(page.trace.summary())          # 概览
page.trace.dump_json("trace.json")   # 完整导出
```

开启后所有 **BiDi 命令、事件、网络活动**记录进内存环形缓冲区。适合排查「命令发出去了但没反应」这类问题——能看到到底发出去了没有、返回了什么。

### 9.2 failure_snapshot：失败自动存证

```python
opts.enable_failure_snapshot(True)
opts.set_snapshot_dir("./snapshots")
```

出错时自动截图 + 存 DOM。**并发或无人值守场景下这个必开**——否则失败了你只有一行异常，什么上下文都没有。

### 9.3 action_visual：把鼠标轨迹画出来

```python
opts.enable_action_visual(True)
```

在页面上可视化鼠标行为。调拟人轨迹时这个最有用：轨迹到底是不是贝塞尔曲线、过冲有没有、停顿在哪，直接看比读代码快。

### 9.4 xpath_picker：定位辅助

```python
opts.enable_xpath_picker(True)
```

页面里弹 XPath 选择浮窗，点元素直接给选择器。写选择器阶段能省不少时间。

**这四个都是调试用，生产环境全关**——trace、snapshot、visual 都会注入额外脚本，本身就是可检测的痕迹。

---

## 十、常见坑速查

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 启动后立刻断开 / BiDi 连不上 | `--marionette` 与该内核不兼容 | `opts.enable_marionette(False)` |
| 弹出原生用户名密码对话框 | SOCKS5 账密写进了 `httpauth.*` | 改用 `socksauth.*` |
| 指纹静默失效（无报错） | fpfile 读到半个文件 | 用原子写入（库内已做，别自己写） |
| 代理走了但真实 IP 仍泄漏 | 缺 `webrtc.ice_proxy_only:true` | 补上该行 |
| WebGL 检测通不过 | 只改了 renderer，其余上限没改 | 用成套硬件档案 |
| Canvas 指纹每次都变 | 用了随机而非种子 | 固定 `canvas.seed` |
| `extra` 里的宽高和显卡档案对不上 | 没钉 `profile_id`，档案是随机抽的 | 显式指定 `profile_id` |
| 提权环境下连接失败 | Firefox 155 在提权会话的问题 | `allow_system_access=True` |
| 点击被判定为机器人 | 走了合成事件而非原生事件 | 用 `drag_to` / `page.mouse.*` |
| `geoip` 校验总是失败 | 单个 geo 源抽风 | 有 quorum=2 保护；持续失败配 `manual_geo` |

---

## 十一、上线前检查清单

- [ ] Firefox 内核路径**显式指定**（`set_browser_path` 或环境变量），不依赖自动探测
- [ ] `python -m ruyipage install` 已完成，`python -m ruyipage path` 能输出正确路径
- [ ] `marionette` 与目标内核版本验证过（默认 `True`，闪退就关）
- [ ] fpfile 里有 `webrtc.ice_proxy_only:true`（走代理时）
- [ ] SOCKS5 账密在 `socksauth.*`，HTTP 账密在 `httpauth.*`
- [ ] Canvas / Audio 用**种子**而非随机，种子在 `[1, 2^64-1]`
- [ ] WebGL 字段**成套**（renderer + 各上限值来自同一档案）
- [ ] 用 `extra` 加宽高时，`profile_id` 已钉死
- [ ] `require_country` 与代理出口位置一致（不一致会抛 `CountryMismatchError`）
- [ ] `apply_emulation()` 已调用（纵深防御层）
- [ ] 拟人算法按场景选：默认 `bezier`，需要更强随机性用 `windmouse`
- [ ] `drag_to` 的 `duration` ≥ 1.0s
- [ ] 调试开关（`trace` / `failure_snapshot` / `action_visual` / `xpath_picker`）**生产环境全部关闭**
- [ ] 日志不打印 fpfile 全文（含代理账密）

---

## 结语

ruyiPage 的思路和 Chromium 系反检测工具是两条路：

**Chromium 系**在运行时打补丁——CDP 注入、hook `navigator`、重写 `page.mouse`。优点是生态成熟、Playwright 兼容；缺点是补丁本身可以被反查。

**ruyiPage** 走内核原生——指纹在 C++ getter 层改写，配置是声明式的 fpfile。优点是痕迹更干净、指纹可控性更强；代价是 API 自成一套、需要理解 fpfile 的字段语义。

选哪条取决于目标站点的判定维度。有一条经验值得记住：**如果 Chromium 系（包括反检测的）在某个目标上被整片拒绝，而换内核后有质变——那说明判定发生在内核层，继续调参数是浪费时间。**

> 文中的域名、端口、密钥、路径全部为占位符。请在自己的合法测试环境中使用。
