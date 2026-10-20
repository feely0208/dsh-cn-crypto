# @deepwhale-cn/dsh-cn-crypto

**该用国密的地方，有没有还在用国际算法。**

**关键词**：国密 · 商用密码 · SM2 · SM3 · SM4 · 密评 · 密码应用安全性评估 · 等保密码要求 · GB/T 39786

---

## 先说清楚它是什么、不是什么

**是** —— 一个**条件性**检查器：只在你项目里确实存在密码学代码时才运行，检查该用国密的地方有没有还在用国际算法或不安全参数。

**不是** —— 不是「所有项目都必须用国密」。国密不是普遍强制要求：只有**涉及商用密码的场景**（关键信息基础设施、等保三级及以上、金融/政务/能源等有行业要求、需要过密评）才有强制要求。所以本插件的每条规则都用 `when` 限定，纯业务代码的项目上**一条都不会跑**，也不会报。

**也不是** —— 不是密码学审计的替代品。它不判断你的密钥管理流程、不检查密码模块资质、不验证协议实现是否正确。报出来的是**提示确认**，不是判定违规。

## 它查什么

5 条，全部只在项目里出现密码学代码时运行：

| 级别 | 规则 | 内容 |
|---|---|---|
| 🔴 高 | `CRYPTO-ECB` | 用了 ECB 模式 —— 含 `aes-128-ecb`、`AES/ECB/PKCS5Padding`、`MODE_ECB`，以及 Java `Cipher.getInstance("AES")` 只写算法名（提供者默认落到 ECB） |
| 🔴 高 | `CRYPTO-WEAK-HASH` | MD5 / SHA-1 的调用点（`createHash('md5')`、`MessageDigest.getInstance("SHA1")`、`hashlib.md5()`、`DigestUtils`、`CryptoJS`，以及 `"md5"` 这类算法名字符串） |
| 🔴 高 | `CRYPTO-RSA-KEYLEN` | RSA 密钥长度 < 2048（512 / 1024 / 1536，出现在 `modulusLength`、`keySize`、`initialize`、`genrsa`、`RSA.generate` 等参数位置） |
| 🔴 高 | `CRYPTO-HARDCODED-IV` | IV / salt 硬编码成字符串字面量，或 Java 用 `IvParameterSpec("...")` 直接包字符串常量 |
| 🟡 中 | `CRYPTO-NO-SM` | **项目里有密码学代码，但全项目找不到 SM2 / SM3 / SM4 的痕迹**（`files-lack` + `when`） |

`CRYPTO-NO-SM` 是最容易被误读的一条：它报出来只代表「这个项目在写密码学代码，但没看到国密」——**先确认这个项目是否落在商用密码的应用范围内**，再决定要不要改。

## 为什么 ECB 这条要单列

ECB 是确定性模式：相同明文分组永远加密成相同密文分组，不隐藏数据的重复结构。它没有链接、没有 IV，无法提供语义安全。

最容易漏的是 Java：

```java
Cipher.getInstance("AES")                       // ← 提供者默认 ECB/PKCS5Padding
Cipher.getInstance("AES/ECB/PKCS5Padding")      // ← 显式 ECB
Cipher.getInstance("AES/CBC/PKCS5Padding")      // ← 这个才是好的
```

只写 `"AES"` 看起来「没写模式所以没选模式」，实际上选了一个最差的。

## 依据（可查证）

| 规则 | 主要出处 |
|---|---|
| 全部 | GB/T 39786-2018《信息安全技术 信息系统密码应用基本要求》—— 密码算法与工作模式应符合国家密码管理部门的规定 |
| SM2 | GB/T 32918 系列《信息安全技术 SM2 椭圆曲线公钥密码算法》 |
| SM3 | GB/T 32905-2016《信息安全技术 SM3 密码杂凑算法》 |
| SM4 | GB/T 32907-2016《信息安全技术 SM4 分组密码算法》 |
| 条件性 | 《中华人民共和国密码法》第二十七条 —— 要求使用商用密码进行保护的关键信息基础设施，其运营者应当使用商用密码进行保护 |
| 不安全参数 | OWASP Cryptographic Storage Cheat Sheet（ECB 不应用于加密；MD5/SHA-1 不适用于口令与完整性；RSA 密钥长度不低于 2048 位；IV 与 salt 必须随机且每次不同） |

## 安装

```bash
dsh plugin --profile web add @deepwhale-cn/dsh-cn-crypto
# 或纯 CLI
npx @deepwhale-cn/dsh-cn-crypto
```

## 用法

```bash
dsh-cn-crypto --demo          # 用内置样本看检出效果
dsh-cn-crypto --list-rules    # 列出规则和依据
dsh-cn-crypto --html r.html   # HTML 报告给安全负责人
dsh-cn-crypto --json          # 给 CI 二次处理
dsh-cn-crypto --quiet         # 只输出结论行
```

退出码：有 high/critical 命中为 1，可挂 CI 卡口。

## 边界

- **不做缺项判定** —— 没看到国密不等于违规，见上文「先说清楚它是什么、不是什么」。
- **不看部署层** —— 密码机、KMS、网关侧的统一加密不在扫描范围内。
- **不校验密码模块资质** —— 用了 SM4 也不代表用的是通过认证的密码模块。
- **不判断密钥管理** —— 密钥轮换、分级、托管都不在范围。
- **MD5 用于非安全用途不算** —— 缓存键去重、对象存储 ETag 这类不属于安全用途，可以忽略对应提示。

本插件是一个工具。使用者必须遵守所在地区法律法规，**对使用本项目造成的任何后果自行承担责任。**

---

## 深鲸网安守护系列（共 38 个）

> 一个插件做一件事。**安全问题是链式的** —— 配套用才完整。

**国内合规**（12）｜ [等保对照](https://github.com/feely0208/dsh-cn-mlps) · [日志留存](https://github.com/feely0208/dsh-cn-log-retention) · [备案公示](https://github.com/feely0208/dsh-cn-filing) · [用户同意](https://github.com/feely0208/dsh-consent-guard) · [个人信息权利](https://github.com/feely0208/dsh-data-rights) · [未成年人保护](https://github.com/feely0208/dsh-minor-guard) · [影响评估](https://github.com/feely0208/dsh-pipia) · [数据分类分级](https://github.com/feely0208/dsh-data-classify) · [算法备案](https://github.com/feely0208/dsh-algorithm-filing) · [数据出境](https://github.com/feely0208/dsh-cn-data-export) · [国密合规](https://github.com/feely0208/dsh-cn-crypto) · [AI 内容标识](https://github.com/feely0208/dsh-cn-ai-labeling)

**AI 与 Agent 治理**（6）｜ [AI 输出信任](https://github.com/feely0208/dsh-ai-output-trust) · [外部内容信任](https://github.com/feely0208/dsh-content-trust) · [MCP 安全](https://github.com/feely0208/dsh-mcp-audit) · [Agent 权限](https://github.com/feely0208/dsh-agent-scope) · [策略核对](https://github.com/feely0208/dsh-agent-policy) · [可疑指令](https://github.com/feely0208/dsh-phishing-guard)

**数据与凭据**（5）｜ [敏感数据](https://github.com/feely0208/dsh-data-scan) · [密钥轮换](https://github.com/feely0208/dsh-key-rotate) · [数据留存](https://github.com/feely0208/dsh-data-lifecycle) · [配置审计](https://github.com/feely0208/dsh-env-audit) · [密钥扫描](https://github.com/feely0208/dsh-secret-scan)

**供应链与构建**（5）｜ [开源许可](https://github.com/feely0208/dsh-license-guard) · [依赖投毒](https://github.com/feely0208/dsh-dep-audit) · [CI 安全](https://github.com/feely0208/dsh-ci-guard) · [工具审查](https://github.com/feely0208/dsh-tool-vet) · [物料清单](https://github.com/feely0208/dsh-sbom)

**权限与应急**（3）｜ [最小权限](https://github.com/feely0208/dsh-least-privilege) · [告警外发](https://github.com/feely0208/dsh-alert-relay) · [应急证据包](https://github.com/feely0208/dsh-incident-package)

**行业专项**（4）｜ [医疗行业专项](https://github.com/feely0208/dsh-industry-medical) · [教育行业专项](https://github.com/feely0208/dsh-industry-education) · [金融行业专项](https://github.com/feely0208/dsh-industry-finance) · [地方数据条例](https://github.com/feely0208/dsh-local-regulation)

**编排与交付**（3）｜ [一键体检](https://github.com/feely0208/dsh-guard-suite) · [改前改后复核](https://github.com/feely0208/dsh-fix-verify) · [合规可交付文档](https://github.com/feely0208/dsh-compliance-doc)

都在 DSH 插件市场（dsh-plugin.org）、npm 和 deepwhale.org.cn/guard.html 上。
