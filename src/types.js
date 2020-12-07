//
// Copyright 2019 Wireline, Inc.
//

import assert from 'assert';
import { Validator } from 'jsonschema';

import RecordSchema from './schema/record.json';
import { Util } from './util';

/**
 * Record.
 */
export class Record {
  /**
   * New Record.
   * @param {object} record
   */
  constructor(record) {
    assert(record);

    const validator = new Validator();
    const result = validator.validate(record, RecordSchema);
    if (!result.valid) {
      result.errors.map(console.error);
      throw new Error('Invalid record input.');
    }

    this._record = record;
  }

  /**
   * Serialize record.
   */
  serialize() {
    return Util.sortJSON({
      'attributes': btoa(JSON.stringify(this._record))
    });
  }

  /**
   * Get message to calculate record signature.
   */
  getMessageToSign() {
    return Util.sortJSON(this._record);
  }
}

/**
 * Record Signature.
 */
export class Signature {

  /**
   * New Signature.
   * @param {string} pubKey
   * @param {string} sig
   */
  constructor(pubKey, sig) {
    assert(pubKey);
    assert(sig);

    this._pubKey = pubKey;
    this._sig = sig;
  }

  /**
   * Serialize Signature.
   */
  serialize() {
    return Util.sortJSON({
      'pubKey': this._pubKey,
      'sig': this._sig
    });
  }
}

/**
 * Message Payload.
 */
export class Payload {

  /**
   * New Payload.
   * @param {object} record
   * @param  {...any} signatures
   */
  constructor(record, ...signatures) {
    assert(record);

    this._record = record;
    this._signatures = signatures;
  }

  get record() {
    return this._record;
  }

  get signatures() {
    return this._signatures;
  }

  /**
   * Add message signature to payload.
   * @param {object} signature
   */
  addSignature(signature) {
    assert(signature);

    this._signatures.push(signature);
  }

  /**
   * Serialize Payload.
   */
  serialize() {
    return Util.sortJSON({
      'record': this._record.serialize(),
      'signatures': this._signatures.map(s => s.serialize())
    });
  }
}

/**
 * Transaction Message.
 */
export class Msg {

  /**
   * New Message.
   * @param {string} operation
   * @param {object} value
   */
  constructor(operation, value) {
    assert(operation);
    assert(value);

    this._operation = operation;
    this._value = value;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': this._operation,
      'value': this._value
    });
  }
}

/**
 * Transaction.
 */
export class Transaction {

  /**
   * New Transaction.
   * @param {object} message
   * @param {object} account
   * @param {object} fee
   * @param {string} signature
   * @param {string} chainID
   */
  constructor(message, account, fee, signature, chainID) {
    assert(message);
    assert(account);
    assert(fee);
    assert(signature);
    assert(chainID);

    this._message = message;
    this._account = account;
    this._fee = fee;
    this._signature = signature;
    this._chainID = chainID;
  }

  /**
   * Serialize Transaction.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'cosmos-sdk/StdTx',
      'value': {
        'chain_id': this._chainID,
        'msg': [this._message.serialize()],
        'fee': this._fee,
        'signatures': [
          {
            'pub_key': {
              'type': 'tendermint/PubKeySecp256k1',
              'value': this._account.publicKey.toString('base64')
            },
            'signature': this._signature.toString('base64')
          }
        ],
        'memo': ''
      }
    });
  }
}
