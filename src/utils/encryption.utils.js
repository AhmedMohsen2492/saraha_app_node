import CryptoJS from "crypto-js";

export const Encryption = async ({ value, secretKey } = {}) => {
    return CryptoJS.AES.encrypt(JSON.stringify(value), secretKey).toString();
}

export const Decryption = async ({ cipher, secretKey } = {}) => {
    const decryptedValue = CryptoJS.AES.decrypt(cipher, secretKey).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedValue);
}
