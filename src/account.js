//
// Copyright 2019 Wireline, Inc.
//

import sha256 from 'js-sha256';
import ripemd160 from 'ripemd160';
import secp256k1 from 'secp256k1/elliptic';
import bip39 from 'bip39';
import bech32 from 'bech32';
import hdkey from 'ethereumjs-wallet/hdkey';

const AMINO_PREFIX = 'EB5AE98721';
const HDPATH = "m/44'/118'/0'/0/0";
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
   * Get record signature.
   * @param {object} record
   */
  signRecord(record) {
    let recordAsJson = JSON.stringify(record, null, 2);
    // Double sha256.
    let recordBytesToSign = Buffer.from(sha256(Buffer.from(sha256(Buffer.from(recordAsJson)), 'hex')), 'hex');

    return this.sign(recordBytesToSign);
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
    let seed = bip39.mnemonicToSeed(mnemonic);

    let wallet = hdkey.fromMasterSeed(seed);
    let account = wallet.derivePath(HDPATH);

    let privateKey = account.getWallet().getPrivateKey();
    return new Account(privateKey);
  }
}
