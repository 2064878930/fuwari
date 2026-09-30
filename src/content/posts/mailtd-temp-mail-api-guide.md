---
title: Mail.td 临时邮箱接口使用指南：argon2id 凭证与工作量证明
published: 2026-10-01
description: 'Mail.td（mail.td）非官方接口的对接要点：auth_key 派生算法、SHA-256 工作量证明、创建/登录/收信流程与限流处理，附 TypeScript 示例。'
image: ''
tags: [TypeScript, 爬虫, 临时邮箱, 逆向, API, 教程]
category: '技术'
draft: false
lang: ''
---

## 前言

Mail.td（`https://mail.td`）是只能**收信**的临时邮箱。它的接口没有公开文档，本文内容来自站点前端 bundle（`_next/static/chunks/7533-*.js`、`8873-*.js`）的逆向分析，以及用调试器抓到真实创建请求后的验证。

和 EmailTick 完全不同，Mail.td 是一套**干净的 JSON API**，没有 HTML 要解析。但它多了两个门槛：**创建邮箱要提交 argon2id 派生的凭证**，以及**要通过一道 SHA-256 工作量证明**。这两步不在服务端做，必须客户端自己算。

实现代码在爬虫项目的 `Electron-Vue-Linear-Template-master/electron/platforms/mailtd/`，TypeScript，依赖 `hash-wasm` 做 argon2id。

> 文中出现的地址、密码、token 全部是占位符。

---

## 一、四个凭证，先搞清楚各是什么

| 名称 | 谁产生 | 存在哪 |
|---|---|---|
| 密码 | 前端随机 8 位，字符表 `a-zA-Z0-9!@#$%` | 只在浏览器 `sessionStorage`（键名 `tempmail_pw_v1`） |
| `auth_key` | `argon2id(密码, salt)` 算出来的 | 创建和登录时提交给服务器 |
| JWT | `POST /api/accounts` 或 `POST /api/token` 返回的 `token` | 之后放在 `Authorization: Bearer` |
| 工作量证明 | `pow.t` unix 秒、`pow.n` nonce、`pow.d` 难度 | 只在免费创建时需要 |

关键点：**服务器只保存 `auth_key`，不保存密码明文**。密码丢了就找不回来，所以本地要存好——这也是桌面客户端把密码写进本机文件的原因。

### auth_key 怎么算

```text
salt = SHA-256(地址小写去空格后的原始 32 字节)
auth_key = argon2id(密码, salt, parallelism=1, iterations=3, memorySize=16384 KiB, hashLength=32)
输出 hex
```

注意 salt 是**原始字节**，不是 hex 字符串再转一次。实现时很容易在这里出错：

```typescript
export async function deriveAuthKey(address: string, password: string): Promise<string> {
  const saltHex = await sha256(address.toLowerCase().trim());
  return argon2id({
    password,
    salt: hexToBytes(saltHex),   // hex 转回字节，这一步别漏
    parallelism: 1,
    iterations: 3,
    memorySize: 16384,
    hashLength: 32,
    outputType: 'hex',
  });
}
```

---

## 二、工作量证明怎么解

规则很直白：找**最小的十进制整数 `n`**，使

```text
SHA-256(小写地址 + t的十进制 + n的十进制)
```

的前 `d` 个比特全为 0。默认难度 `d = 15`。

```typescript
export function solveProofOfWork(address: string, timestamp: number, difficulty: number): string {
  const prefix = address.toLowerCase().trim() + String(timestamp);
  for (let nonce = 0; nonce < 8_000_000; nonce += 1) {
    const digest = createHash('sha256').update(prefix + String(nonce)).digest();
    if (hasLeadingZeroBits(digest, difficulty)) return String(nonce);
  }
  throw new Error(`工作量证明在 8,000,000 次内没有解出来（难度 ${difficulty}）。`);
}
```

几个实现细节：

- **拼的是十进制字符串**，`t` 和 `n` 都直接 `String()`，不是二进制也不是十六进制。
- 地址要**先转小写**再拼，和 salt 的规则一致。
- 判断前 d 比特要处理非 8 整除的情况：先检查完整的字节是否全 0，再用位掩码检查剩下的比特。
- 设一个尝试次数上限，避免异常难度把主线程卡死。难度 15 一般几十毫秒内出解。

---

## 三、创建邮箱的完整流程

```text
1. GET  /api/domains                     → 选一个非 pro_only 的域名
2. 随机本地部分（6 位 a-z0-9）+ 随机 8 位密码
3. 算 auth_key
4. 解工作量证明
5. POST /api/accounts                    → 拿 id 和 token
```

```typescript
const result = await transport.request('POST', '/api/accounts', {
  body: {
    address,                       // 例如 ab12cd@mail.td
    auth_key: authKey,
    pow: { t: timestamp, n: nonce, d: difficulty },
  },
});
// 201: { id, address, token, suggested_next_difficulty }
```

### 难度会动态调整

站点会在响应里给 `suggested_next_difficulty`，**下次创建时用这个新难度**。另外如果响应 `status` 是 `retry`，说明这次算的难度不够，要用返回的 `required_difficulty` 和 `token` 重算：

```typescript
if (payload.status === 'retry') {
  difficulty = Number(payload.required_difficulty);
  powToken = payload.token;      // 重算时必须带上这个 token
  continue;                      // 最多重试 3 次
}
```

`pow.token` 只在重算时带，首次创建不带。

---

## 四、接口一览

基址 `https://mail.td`。JSON 请求带 `Content-Type: application/json`。

> **Electron 里要在发送前补上 `Origin: https://mail.td`**——浏览器 fetch 会自动带，但 Electron 的 `session.fetch` 会丢掉这个头，站点会拒绝。

| 作用 | 请求 | 说明 |
|---|---|---|
| 域名列表 | `GET /api/domains` | `{domains:[{domain,default,pro_only}]}`，`pro_only` 为真的跳过 |
| 创建 | `POST /api/accounts` | `{address,auth_key,pow:{t,n,d,token?}}`，201 返回 `{id,address,token,suggested_next_difficulty}` |
| 登录 | `POST /api/token` | `{address,auth_key}`，返回同样带 `id` 和 `token` |
| 邮箱信息 | `GET /api/accounts/{id}` | Bearer 认证。`{address,quota,used,role,...}` |
| 收件箱 | `GET /api/accounts/{id}/messages?page=` | `{messages,page}`，一页 30 封 |
| 正文 | `GET /api/accounts/{id}/messages/{messageId}` | `html_body` 或 `text_body`，附件在 `attachments` |
| 删除一封 | `DELETE /api/accounts/{id}/messages/{messageId}` | |
| 清空收件箱 | `DELETE /api/accounts/{id}/messages` | 只删信，不删邮箱 |
| 实时推送 | `WebSocket /api/ws` | 首帧 `{type:"auth",token}`，新信是 `{type:"new_email",...}` |

列表和推送里能看到的字段：`id`、`sender`、`from`、`subject`、`preview_text`、`size`、`created_at`。

---

## 五、收信与登录

### 收信

列表接口一页 30 封，翻页直到某页不满 30 就停：

```typescript
for (let page = 1; page <= 5; page += 1) {
  const result = await transport.request('GET', `/api/accounts/${id}/messages?page=${page}`, {
    token,
  });
  const rows = result.data?.messages ?? [];
  // ... 收集
  if (rows.length < 30) break;
}
```

读正文时 `html_body` 和 `text_body` 二选一，有 HTML 就优先用它再转纯文本，比 `text_body` 格式更完整。

### 重新登录

只要地址和密码就能换回 token，密码是本地存的，`auth_key` 用同一套算法现算：

```typescript
const authKey = await deriveAuthKey(address, password);
const result = await transport.request('POST', '/api/token', {
  body: { address, auth_key: authKey },
});
// 返回 { id, token, address }
```

登录过期是 **401**，收到后提示用户用地址 + 密码重新打开。

### 实时推送（可选）

客户端目前没接 WebSocket，用的是「检查邮件」轮询。如果要接：

```text
连接 /api/ws → 首帧发 {"type":"auth","token":"<JWT>"} → 之后收 {"type":"new_email",...}
```

---

## 六、错误处理

| 情况 | 状态码 | 处理 |
|---|---|---|
| 地址已被占用 | 409 | 换一个本地部分重试 |
| 创建太频繁 | 429 | 过一会儿再试，不要循环重试 |
| 登录过期 | 401 | 用地址 + 密码重新登录 |
| 难度不够 | 200 + `status:"retry"` | 用 `required_difficulty` 和 `token` 重算 |

还有一个容易漏的情况：站点可能返回 **Cloudflare 检查页而不是 JSON**。判断方式是状态码是 403 或 503，且响应体含 `Just a moment`、`cf-browser-verification` 或 `challenge-platform`。遇到时提示稍后再试，不要当成接口错误。

---

## 七、限制

- 只能收信，不能发信。
- 密码和 token 存在本机（桌面客户端在 `userData/mailtd-accounts.json`，最多 20 条）。**这个文件含明文密码，不要同步到别处。**
- 附件只提示数量，不下载。
- Premium、OAuth、自定义域名、webhook 不在本次范围内。
