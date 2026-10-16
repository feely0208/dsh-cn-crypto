import { createPlugin, pkgRootFrom } from '@deepwhale-cn/dsh-guard-core/plugin';

export const { name, inject, apply } = createPlugin({
  name: 'cn-crypto',
  pkgRoot: pkgRootFrom(import.meta.url),
  skillFile: 'skill/cn-crypto.md',
  binFile: 'bin/cli.mjs',
  description: '该用国密的地方，有没有还在用国际算法或不安全参数（ECB、MD5/SHA1、RSA<2048、硬编码 IV）',
  whenToUse: '项目里已经在写密码学代码（Node crypto / Java Cipher / Python cryptography、hashlib），需要确认是否该改用国密（SM2/SM3/SM4）、或需要过商用密码应用安全性评估（密评）、或在做等保三级及以上整改、或属于金融/政务/能源等有商用密码要求的行业时使用。用户会说：「国密合规」「商密」「SM2/SM3/SM4」「密评」「密码应用安全性评估」「等保密码要求」「我们还在用 AES/RSA 行不行」「看看加密写得对不对」。也在评审加密相关代码、排查密钥与 IV 用法、准备合规材料前使用。',
});
