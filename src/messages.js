//
// Copyright 2019 Wireline, Inc.
//

import { Util } from './util';

/**
 * Send-coins message from cosmos-sdk bank module.
 */
export class MsgSend {

  /**
   * @constructor
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {object[]} amount
   */
  constructor(fromAddress, toAddress, amount) {
    console.assert(fromAddress);
    console.assert(toAddress);
    console.assert(amount && amount.length);

    this._fromAddress = fromAddress;
    this._toAddress = toAddress;
    this._amount = amount;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'cosmos-sdk/MsgSend',
      'value': {
        'from_address': this._fromAddress,
        'to_address': this._toAddress,
        'amount': this._amount
      }
    });
  }
}

/**
 * Create bond message.
 */
export class MsgCreateBond {

  /**
   * @constructor
   * @param {string} owner
   * @param {object[]} amount
   */
  constructor(owner, amount) {
    console.assert(owner);
    console.assert(amount);

    this._owner = owner;
    this._amount = amount;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'bond/CreateBond',
      'value': {
        'coins': this._amount,
        'signer': this._owner
      }
    });
  }
}

/**
 * Refill bond message.
 */
export class MsgRefillBond {

  /**
   * @constructor
   * @param {string} id
   * @param {string} owner
   * @param {object[]} amount
   */
  constructor(id, owner, amount) {
    console.assert(id);
    console.assert(owner);
    console.assert(amount);

    this._id = id;
    this._owner = owner;
    this._amount = amount;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'bond/RefillBond',
      'value': {
        'id': this._id,
        'coins': this._amount,
        'signer': this._owner
      }
    });
  }
}

/**
 * Withdraw bond message.
 */
export class MsgWithdrawBond {

  /**
   * @constructor
   * @param {string} id
   * @param {string} owner
   * @param {object[]} amount
   */
  constructor(id, owner, amount) {
    console.assert(id);
    console.assert(owner);
    console.assert(amount);

    this._id = id;
    this._owner = owner;
    this._amount = amount;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'bond/WithdrawBond',
      'value': {
        'id': this._id,
        'coins': this._amount,
        'signer': this._owner
      }
    });
  }
}

/**
 * Cancel bond message.
 */
export class MsgCancelBond {

  /**
   * @constructor
   * @param {string} id
   * @param {string} owner
   */
  constructor(id, owner) {
    console.assert(id);
    console.assert(owner);

    this._id = id;
    this._owner = owner;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'bond/CancelBond',
      'value': {
        'id': this._id,
        'signer': this._owner
      }
    });
  }
}
