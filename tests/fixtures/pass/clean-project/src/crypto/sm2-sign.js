// 报文签名与验签 —— SM2（GB/T 32918）
import { sm2 } from 'sm-crypto';

const keypair = sm2.generateKeyPairHex();

export function publicKey() {
  return keypair.publicKey;
}

export function signPayload(payload) {
  return sm2.doSignature(payload, keypair.privateKey, { hash: true });
}

export function verifyPayload(payload, signature) {
  return sm2.doVerifySignature(payload, signature, keypair.publicKey, { hash: true });
}
