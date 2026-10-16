package com.example.legacy;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * 老结算系统沿用的加解密工具类。
 * 2018 年从旧平台迁移时整包带过来的，参数一直没动过。
 */
public final class LegacyCipherTool {

    private static final int RSA_KEY_SIZE = 1024;

    private LegacyCipherTool() {
    }

    /** 默认模式加密 —— 调用方只传了算法名，模式交给提供者默认 */
    public static byte[] encryptDefault(byte[] data, byte[] key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"));
        return cipher.doFinal(data);
    }

    /** 显式 ECB 加密（旧报文格式要求） */
    public static byte[] encryptEcb(byte[] data, byte[] key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"));
        return cipher.doFinal(data);
    }

    /** CBC 加密，但 IV 是写死的常量 */
    public static byte[] encryptCbc(byte[] data, byte[] key) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        IvParameterSpec spec = new IvParameterSpec("1234567890abcdef".getBytes("UTF-8"));
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), spec);
        return cipher.doFinal(data);
    }

    /** 操作员口令摘要 */
    public static String digestPassword(String raw) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA1");
        byte[] out = digest.digest(raw.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : out) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    /** 结算通道密钥对 */
    public static KeyPair generateChannelKeyPair() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(RSA_KEY_SIZE);
        return generator.generateKeyPair();
    }
}
