#!/usr/bin/env python3
"""对账文件处理 —— SM4-CBC 加密、SM3 杂凑。"""

import os

from gmssl import sm3 as sm3_mod
from gmssl.sm4 import CryptSM4, SM4_ENCRYPT, SM4_DECRYPT


def encrypt_recon(payload: bytes, key: bytes) -> bytes:
    iv = os.urandom(16)
    crypt = CryptSM4()
    crypt.set_key(key, SM4_ENCRYPT)
    return iv + crypt.crypt_cbc(iv, payload)


def decrypt_recon(blob: bytes, key: bytes) -> bytes:
    iv, payload = blob[:16], blob[16:]
    crypt = CryptSM4()
    crypt.set_key(key, SM4_DECRYPT)
    return crypt.crypt_cbc(iv, payload)


def digest_recon(payload: bytes) -> str:
    return sm3_mod.sm3_hash(list(payload))


if __name__ == '__main__':
    print(digest_recon(b'sample'))
