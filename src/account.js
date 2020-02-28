//
// Copyright 2019 Wireline, Inc.
//

import sha256 from 'js-sha256';
import Ripemd160 from 'ripemd160';
import secp256k1 from 'secp256k1/elliptic';
import * as bip32 from 'bip32';
import bip39 from 'bip39';
import bech32 from 'bech32';
import canonicalStringify from 'canonical-json';

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
    this._privateKey = privateKey;

    // 1. Generate public key.
    this._publicKey = secp256k1.publicKeyCreate(this._privateKey);

    // 2. Generate cosmos-sdk address.
    let publicKeySha256 = sha256(this._publicKey);
    this._cosmosAddress = new Ripemd160().update(Buffer.from(publicKeySha256, 'hex')).digest().toString('hex');

    // 3. Generate cosmos-sdk formatted address.
    const buffer = Buffer.from(this._cosmosAddress, 'hex');
    const words = bech32.toWords(buffer);
    this._formattedCosmosAddress = bech32.encode('cosmos', words);

    // 4. Generate registry formatted public key.
    const publicKeyInHex = AMINO_PREFIX + this._publicKey.toString('hex');
    this._registryPublicKey = Buffer.from(publicKeyInHex, 'hex').toString('base64');

    // 5. Generate registry formatted address.
    publicKeySha256 = sha256(Buffer.from(publicKeyInHex, 'hex'));
    this._registryAddress = new Ripemd160().update(Buffer.from(publicKeySha256, 'hex')).digest().toString('hex');
  }

  get privateKey() {
    return this._privateKey;
  }

  get publicKey() {
    return this._publicKey;
  }

  get cosmosAddress() {
    return this._cosmosAddress;
  }

  get formattedCosmosAddress() {
    return this._formattedCosmosAddress;
  }

  get registryPublicKey() {
    return this._registryPublicKey;
  }

  get registryAddress() {
    return this._registryAddress;
  }

  /**
   * Get private key.
   */
  getPrivateKey() {
    return this._privateKey.toString('hex');
  }

  /**
   * Get public key.
   */
  getPublicKey() {
    return this._publicKey.toString('hex');
  }

  /**
   * Get cosmos address.
   */
  getCosmosAddress() {
    return this._formattedCosmosAddress;
  }

  /**
   * Get record signature.
   * @param {object} record
   */
  signRecord(record) {
    const recordAsJson = canonicalStringify(record);
    // Double sha256.
    const recordBytesToSign = Buffer.from(sha256(Buffer.from(sha256(Buffer.from(recordAsJson)), 'hex')), 'hex');

    return this.sign(recordBytesToSign);
  }

  /**
   * Sign message.
   * @param {object} msg
   */
  sign(msg) {
    const messageToSignSha256 = sha256(msg);
    const messageToSignSha256InBytes = Buffer.from(messageToSignSha256, 'hex');
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
    const seed = bip39.mnemonicToSeed(mnemonic);
    const wallet = bip32.fromSeed(seed);
    const account = wallet.derivePath(HDPATH);
    const { privateKey } = account;

    return new Account(privateKey);
  }
}
