import EncryptedStorage from 'react-native-encrypted-storage';

export default class KeyManager {
  constructor() {
    var RSAKey = require('react-native-rsa');
    this.rsa = new RSAKey();
  }

  encrypt(str, key) {
    var parts = str.match(/.{1,70}/g);
    var result = []
    this.rsa.setPublicString(key);
    parts.forEach((str, i) => {
      result.push(this.rsa.encrypt(str))
    });
    return result
  }

  decrypt(parts, key) {
    var result = ''
    this.rsa.setPrivateString(key);
    parts.forEach((part, i) => {
      result = result + this.rsa.decrypt(part);
    });
    return result
  }

  generate() {
    this.rsa.generate(1024, '10001');
    var publicKey = this.rsa.getPublicString();
    var privateKey = this.rsa.getPrivateString();
    return [publicKey, privateKey]
  }

  async getKey(name) {
    try {
      const session = await EncryptedStorage.getItem(name);
    } catch (error) {
      console.log(error)
    }
    return session
  }

  async saveKey(name, value) {
    try {
      await EncryptedStorage.setItem(name, value);
    } catch (error) {
      console.log(error)
    }
  }
}
