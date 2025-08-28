import random
import string
import base64
import hashlib


def generate_key_pair():
    """サーバーの公開鍵・秘密鍵のペアを生成（シミュレーション）"""
    public_key = ''.join(random.choices(string.ascii_letters + string.digits, k=20))
    private_key = ''.join(random.choices(string.ascii_letters + string.digits, k=20))
    return public_key, private_key


def generate_common_key():
    """共通鍵を生成（シミュレーション）"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits + '_', k=16))


def public_key_encrypt(data, public_key):
    """公開鍵暗号化のシミュレーション"""
    combined = data + public_key
    encoded = base64.b64encode(combined.encode()).decode()
    scrambled = ''.join(random.choices(string.ascii_letters + string.digits + '+/=', k=len(encoded)))
    return scrambled


def private_key_decrypt(encrypted_data, private_key, original_common_key):
    """秘密鍵復号化のシミュレーション（元の共通鍵を返す）"""
    return original_common_key


def common_key_encrypt(message, common_key):
    """共通鍵暗号化のシミュレーション"""
    combined = message + common_key
    hash_obj = hashlib.md5(combined.encode())
    hex_hash = hash_obj.hexdigest()
    scrambled = ''.join(random.choices(string.ascii_letters + string.digits, k=len(hex_hash)))
    return scrambled


def common_key_decrypt(encrypted_message, common_key, original_message):
    """共通鍵復号化のシミュレーション（元のメッセージを返す）"""
    return original_message