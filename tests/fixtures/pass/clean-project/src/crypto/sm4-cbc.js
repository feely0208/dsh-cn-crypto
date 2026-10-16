// 结算报文保护 —— SM4-CBC 加密、SM3 杂凑
import { randomBytes } from 'node:crypto';
import { sm3, sm4 } from 'sm-crypto';

const MASTER_KEY_HEX = process.env.SETTLEMENT_MASTER_KEY;

/** 加密报文：每次生成独立 IV，随密文一起返回 */
export function encryptMessage(plaintext) {
  const ivHex = randomBytes(16).toString('hex');
  const ciphertext = sm4.encrypt(plaintext, MASTER_KEY_HEX, { mode: 'cbc', iv: ivHex, output: 'string' });
  return { ivHex, ciphertext };
}

/** 解密报文：IV 由调用方从报文头取出 */
export function decryptMessage(ciphertext, ivHex) {
  return sm4.decrypt(ciphertext, MASTER_KEY_HEX, { mode: 'cbc', iv: ivHex, output: 'string' });
}

/** 操作员口令：先加每用户独立的盐，再做 SM3 摘要 */
export function digestPassword(raw, perUserSalt) {
  return sm3(`${perUserSalt}:${raw}`);
}

/** 对账文件完整性摘要 */
export function digestFile(buffer) {
  return sm3(buffer.toString('binary'));
}
