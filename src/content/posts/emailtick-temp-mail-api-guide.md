---
title: EmailTick 临时邮箱接口使用指南：Python 收验证码
published: 2026-10-01
description: 'EmailTick（emailtick.com）非官方接口的实用封装：会话保持、取邮箱、查信、读正文、换邮箱与验证码处理，附可直接运行的 Python 示例。'
image: ''
tags: [Python, 爬虫, 临时邮箱, API, 教程]
category: '技术'
draft: false
lang: ''
---

## 前言

EmailTick（`https://www.emailtick.com`）是只能**收信**的临时邮箱。站点没有公开 API，`emailtick.py` 走的是网页自己用的那几条 JSON 接口，纯标准库实现，Python 3.10+ 直接跑。

代码在爬虫项目 `临时Google邮箱/emailtick.py`，配一个 Tkinter 测试窗口 `app.py`。

> 文中出现的邮箱、`code` 全部是占位符。

---

## 一、先记住一条规则：复用同一个客户端

会话状态分三处，靠 Cookie 串起来：

| 载体 | 内容 | 生命周期 |
|---|---|---|
| `code` | 邮箱操作凭证，藏在首页 HTML 隐藏输入框 | 每次查信后重新解析 |
| `active_mailbox` | 当前邮箱地址（HttpOnly Cookie） | 约 1 天 |
| `mailbox_history` | 历史邮箱列表（HttpOnly Cookie） | 约 30 天 |

**一个客户端实例从头用到尾。** 每次操作新开进程会丢掉 Cookie，邮箱状态就乱了。另外同一出口 IP 在有效期内会分到同一个旧邮箱——想换地址得主动调接口，不是重启就能换。

---

## 二、五分钟上手

```python
from emailtick import EmailTick

client = EmailTick(lang="zh")   # lang 默认 zh

# 1. 取一个邮箱
box = client.open()
print(box.email, box.code)

# 2. 收信（列表在首页 HTML 里，不是 JSON）
for message in client.check():
    print(message.sender, message.subject, message.timestamp)

    # 3. 读正文：先拿标题，再拿正文，两步
    if message.url:
        detail = client.read(message)
        print(detail.subject)
        print(detail.text)
```

就这三步。命令行直接 `python emailtick.py` 会打印邮箱、收件箱数量、每封信的标题正文和历史。

### 常用操作

```python
# 换 Gmail 形态：1 点号，2 加号，3 googlemail.com
client.change(gmail_type=1)

# 换域名邮箱
client.change(domain="smarta4.com")   # 或 xuanhu.app / bestnamegenerator.com

# 历史记录
for item in client.history():
    print(item.email, item.timestamp)

# 删除历史（三种形态互斥）
client.delete_history(email="a@smarta4.com")
client.delete_history(emails=["a@x.com", "b@x.com"])
client.delete_history(all_items=True)

# 激活历史里的域名邮箱（不需要验证码）
client.activate("abc@smarta4.com")

# 清空当前邮箱和记录，不可恢复
client.clear()
```

`change()` 的 `gmail_type` 和 `domain` 只能传一个，传错会直接报错。

---

## 三、读一封邮件为什么要两个请求

```text
GET /mail/view/{id}            → 只有标题、发件人、时间，正文位置是「正在加载......」
GET /mail/gmail-content/{id}   → 正文 HTML（JSON）
```

第一步页面里用 `var contentUrl` 声明了第二步的地址，客户端自动接着请求，调用方只需 `client.read(message)` 一次。

几个已处理的细节，自己重写时要注意：

- 标题必须取 `<h4>` 里 `<b>` 的文本，`[Subject]` 是固定标签不是标题。
- 邮件已删除时站点返回 **HTTP 404，但页面是完整的**，里面写着 "Broken link, please check"。要把它当成「邮件不存在」而不是网络错误。
- 正文 HTML 要保留段落换行，直接把标签剥掉会把整封信压成一行。
- 页面上的导航、广告、FAQ 跟正文无关，不要一起抓。

---

## 四、两道验证码，程序都不识别

1. **限流验证码**：请求太密时返回 HTTP 429、响应头 `X-Need-Captcha: 1`，或 JSON 里 `{"code":"captcha"}`。客户端抛 `CaptchaRequired`。处理方式是**先在浏览器打开 `https://www.emailtick.com/captcha` 通过**，再继续调用，不要自动重试。
2. **图片验证码**：创建自定义域名邮箱、激活旧 Gmail 别名时要先看图。

```python
png = client.captcha_image()          # GET /captcha/action，PNG 字节
# 人工识别图中 4 个字符后：
client.custom_domain("my_name", "smarta4.com", "AB12")
client.custom_gmail("a.b.c@gmail.com", "AB12")
```

- 用户名规则：6–20 位，字母/数字/下划线；`admin`、`abuse`、`webmaster` 等保留名不可用。
- Gmail 只能激活**以前用过的别名**（本地部分带 `.` 或 `+`），`abc@gmail.com` 这种完整地址会被拒。
- 填错验证码 JSON 里 `status` 为 `3`；地址被占用 `status` 为 `2`，一般要等约 24 小时。

---

## 五、容易踩的坑

- **`POST /get-emails` 只返回 `{"success":true}`**，邮件列表必须重新拉首页 HTML 解析。查完信若还是空的，多半是信没到，等几十秒再点，别猛刷。
- **每次拉首页都要重新解析 `code`**，它可能变化。
- **`GET /captcha/action` 是 PNG**，别丢进 JSON 解析。
- **验证码判断只匹配 JSON 响应体**，因为首页 HTML 脚本里也含 `"code":"captcha"` 这个字面量，拿 HTML 去匹配会误报。
- **`POST /get-mailbox` 是废接口**，实测 HTTP 500。换邮箱用 `/change-mailbox`。

---

## 六、限制

- 临时邮箱约 24 小时后销毁，**只能收信，不能发信**。
- 域名邮箱过期后无法从历史找回；历史找回主要针对用过的 Gmail 别名。
- 站点改版会直接打断 HTML 解析。解析规则靠 `tests/fixtures/` 里的真实页面样本回归，站点一改版先跑 `python tests/test_parse.py`。
