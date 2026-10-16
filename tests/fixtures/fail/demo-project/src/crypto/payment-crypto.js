// 商户号 / 卡号加密与订单签名 —— 历史遗留实现，2018 年上线时写的
import { createCipheriv, createDecipheriv, createHash, generateKeyPairSync, randomBytes } from 'node:crypto';

const APP_KEY_HEX = process.env.PAY_APP_KEY_HEX || '00112233445566778899aabbccddeeff';
const IV = '0102030405060708';
const SALT = 'dsh-pay-2018';

/** 商户号加密（网关内部使用）*/
export function encryptMerchantNo(plain) {
  const cipher = createCipheriv('aes-128-ecb', Buffer.from(APP_KEY_HEX, 'hex'), null);
  let out = cipher.update(plain, 'utf8', 'base64');
  out += cipher.final('base64');
  return out;
}

/** 卡号加密 —— CBC + 固定 IV */
export function encryptCardNo(plain) {
  const cipher = createCipheriv('aes-128-cbc', Buffer.from(APP_KEY_HEX, 'hex'), IV);
  let out = cipher.update(plain, 'utf8', 'base64');
  out += cipher.final('base64');
  return out;
}

export function decryptCardNo(encoded) {
  const decipher = createDecipheriv('aes-128-cbc', Buffer.from(APP_KEY_HEX, 'hex'), IV);
  let out = decipher.update(encoded, 'base64', 'utf8');
  out += decipher.final('utf8');
  return out;
}

/** 订单签名：MD5(订单号 + 金额 + 盐) */
export function signOrder(orderNo, amount) {
  return createHash('md5').update(`${orderNo}|${amount}|${SALT}`).digest('hex');
}

/** 商户接入用的 RSA 密钥对 */
export function generateMerchantKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

/** 对账文件完整性摘要 */
export function checksumFile(buffer) {
  return createHash('md5').update(buffer).digest('hex');
}

export function newRequestId() {
  return randomBytes(8).toString('hex');
}
