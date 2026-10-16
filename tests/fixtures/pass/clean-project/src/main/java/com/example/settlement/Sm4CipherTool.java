package com.example.settlement;

import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * 结算通道加解密工具类 —— SM4-CBC（GB/T 32907）。
 * IV 每次由 SecureRandom 生成，随密文一起提供给对端。
 */
public final class Sm4CipherTool {

    private static final SecureRandom RANDOM = new SecureRandom();

    private Sm4CipherTool() {
    }

    public static byte[] encryptCbc(byte[] data, byte[] key) throws Exception {
        byte[] iv = new byte[16];
        RANDOM.nextBytes(iv);
        Cipher cipher = Cipher.getInstance("SM4/CBC/PKCS5Padding", "BC");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "SM4"), new IvParameterSpec(iv));
        return cipher.doFinal(data);
    }

    public static byte[] decryptCbc(byte[] data, byte[] key, byte[] iv) throws Exception {
        Cipher cipher = Cipher.getInstance("SM4/CBC/PKCS5Padding", "BC");
        cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "SM4"), new IvParameterSpec(iv));
        return cipher.doFinal(data);
    }
}
