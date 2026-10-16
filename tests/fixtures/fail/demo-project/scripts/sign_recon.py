#!/usr/bin/env python3
"""对账文件签名与报文加密 —— 运维脚本，沿用旧逻辑。"""

import hashlib

from Crypto.Cipher import AES
from Crypto.PublicKey import RSA
from Crypto.Util.Padding import pad

KEY = b'0123456789abcdef'
IV = b'0000000000000000'
SALT = b'dsh-pay-2018'


def sign_recon_file(payload: bytes) -> str:
    """对账文件摘要"""
    return hashlib.md5(payload).hexdigest()


def sign_manifest(payload: bytes) -> str:
    return hashlib.sha1(payload).hexdigest()


def hash_operator_password(raw: str) -> str:
    """操作员口令入库前的摘要"""
    return hashlib.md5(raw.encode('utf-8')).hexdigest()


def encrypt_manifest(payload: bytes) -> bytes:
    cipher = AES.new(KEY, AES.MODE_ECB)
    return cipher.encrypt(pad(payload, 16))


def encrypt_manifest_cbc(payload: bytes) -> bytes:
    cipher = AES.new(KEY, AES.MODE_CBC, IV)
    return cipher.encrypt(pad(payload, 16))


def gen_channel_key():
    return RSA.generate(1024)


if __name__ == '__main__':
    print(gen_channel_key().n.bit_length())
