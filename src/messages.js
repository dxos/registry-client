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

  constructor(owner, type, quantity) {
    console.assert(owner);
    console.assert(type);
    console.assert(quantity);


  }
}
