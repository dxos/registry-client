//
// Copyright 2019 Wireline, Inc.
//

import sha256 from 'js-sha256';
import ripemd160 from 'ripemd160';
import secp256k1 from 'secp256k1/elliptic';
import bip39 from 'bip39';
import bech32 from 'bech32';

const AMINO_PREFIX = 'EB5AE98721';
/**
 * Registry account.
 */
// TODO(egor): This is a wrapper around the private key and doesn't have any account related stuff (e.g. account number/sequence). Maybe rename to Key?
export class Account {
  /**
   * New Account.
   * @param {buffer} privateKey
   */
  constructor(privateKey) {
    this.privateKey = privateKey;

    // 1. Generate public key.
    this.publicKey = secp256k1.publicKeyCreate(privateKey);

    // 2. Generate cosmos-sdk address.
    let publicKeySha256 = sha256(this.publicKey);
    this.cosmosAddress = new ripemd160().update(Buffer.from(publicKeySha256, 'hex')).digest().toString('hex');

    // 3. Generate cosmos-sdk formatted address.
    let buffer = Buffer.from(this.cosmosAddress, 'hex');
    let words = bech32.toWords(buffer);
    this.formattedCosmosAddress = bech32.encode('cosmos', words);

    // 4. Generate registry formatted public key.
    let publicKeyInHex = AMINO_PREFIX + this.publicKey.toString('hex');
    this.registryPublicKey = Buffer.from(publicKeyInHex, 'hex').toString('base64');

    // 5. Generate registry formatted address.
    publicKeySha256 = sha256(Buffer.from(publicKeyInHex, 'hex'));
    this.registryAddress = new ripemd160().update(Buffer.from(publicKeySha256, 'hex')).digest().toString('hex');
  }

  /**
   * Get private key.
   */
  getPrivateKey() {
    return this.privateKey.toString('hex');
  }

  /**
   * Get public key.
   */
  getPublicKey() {
    return this.publicKey.toString('hex');
  }

  /**
   * Get cosmos address.
   */
  getCosmosAddress() {
    return this.formattedCosmosAddress;
  }

  /**
   * Get resource signature.
   * @param {object} resource
   */
  signResource(resource) {
    let resourceAsJson = JSON.stringify(resource, null, 2);
    // Double sha256.
    let resourceBytesToSign = Buffer.from(sha256(Buffer.from(sha256(Buffer.from(resourceAsJson)), 'hex')), 'hex');

    return this.sign(resourceBytesToSign);
  }

  /**
   * Sign message.
   * @param {object} msg
   */
  sign(msg) {
    let messageToSignSha256 = sha256(msg);
    let messageToSignSha256InBytes = Buffer.from(messageToSignSha256, 'hex');
    const sigObj = secp256k1.sign(messageToSignSha256InBytes, this.privateKey);

    return sigObj.signature;
  }

  /**
   * Generate bip39 mnemonic.
   */
  static generateMnemonic() {
    return bip39.generateMnemonic();
  }

  /**
   * Generate private key from mnemonic.
   * @param {string} mnemonic
   */
  static generateFromMnemonic(mnemonic) {
    // TODO(egorgripasov): proper key generation from bip39 mnemonic!
    let mnemonicSha256 = sha256(Buffer.from(mnemonic));
    let mnemonicInBytes = Buffer.from(mnemonicSha256, 'hex');

    return new Account(mnemonicInBytes);
  }
}
