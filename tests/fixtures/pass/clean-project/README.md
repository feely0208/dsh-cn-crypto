# 结算服务

对外报文与本地凭据的保护统一使用**国密算法**：

| 用途 | 算法 | 依据 |
|---|---|---|
| 分组加密（报文） | SM4-CBC | GB/T 32907 |
| 杂凑（口令派生、完整性） | SM3 | GB/T 32905 |
| 签名与密钥交换 | SM2 | GB/T 32918 |

实现落在 `src/crypto/` 下，随机数一律走密码学安全随机源：
Node 用 `crypto.randomBytes`，Java 用 `SecureRandom`，Python 用 `os.urandom`。
初始向量（IV）随密文一起存储，不做复用，也不写入代码或配置。
