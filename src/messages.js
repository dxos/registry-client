//
// Copyright 2020 DXOS.org
//

import assert from 'assert';

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
    assert(fromAddress);
    assert(toAddress);
    assert(amount && amount.length);

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
    assert(owner);
    assert(amount);

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
    assert(id);
    assert(owner);
    assert(amount);

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
    assert(id);
    assert(owner);
    assert(amount);

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
    assert(id);
    assert(owner);

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

/**
 * Associate record with bond message.
 */
export class MsgAssociateBond {

  /**
   * @constructor
   * @param {string} id
   * @param {string} bondId
   * @param {string} owner
   */
  constructor(id, bondId, owner) {
    assert(id);
    assert(bondId);
    assert(owner);

    this._id = id;
    this._bondId = bondId;
    this._owner = owner;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'nameservice/AssociateBond',
      'value': {
        'id': this._id,
        'bondId': this._bondId,
        'signer': this._owner
      }
    });
  }
}

/**
 * Dissociate record from bond message.
 */
export class MsgDissociateBond {

  /**
   * @constructor
   * @param {string} id
   * @param {string} owner
   */
  constructor(id, owner) {
    assert(id);
    assert(owner);

    this._id = id;
    this._owner = owner;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'nameservice/DissociateBond',
      'value': {
        'id': this._id,
        'signer': this._owner
      }
    });
  }
}

/**
 * Dissociate all records from bond message.
 */
export class MsgDissociateRecords {

  /**
   * @constructor
   * @param {string} bondId
   * @param {string} owner
   */
  constructor(bondId, owner) {
    assert(bondId);
    assert(owner);

    this._bondId = bondId;
    this._owner = owner;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'nameservice/DissociateRecords',
      'value': {
        'bondId': this._bondId,
        'signer': this._owner
      }
    });
  }
}

/**
 * Reassociate records (switch bondId) message.
 */
export class MsgReassociateRecords {

  /**
   * @constructor
   * @param {string} oldBondId
   * @param {string} newBondId
   * @param {string} owner
   */
  constructor(oldBondId, newBondId, owner) {
    assert(oldBondId);
    assert(newBondId);
    assert(owner);

    this._oldBondId = oldBondId;
    this._newBondId = newBondId;
    this._owner = owner;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'nameservice/ReassociateRecords',
      'value': {
        'oldBondId': this._oldBondId,
        'newBondId': this._newBondId,
        'signer': this._owner
      }
    });
  }
}

/**
 * Reserve authority message.
 */
export class MsgReserveAuthority {

  /**
   * @constructor
   * @param {string} name
   * @param {string} signer
   * @param {string} owner
   */
  constructor(name, signer, owner = '') {
    assert(name);
    assert(signer);

    this._name = name;
    this._signer = signer;
    this._owner = owner;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'nameservice/ReserveAuthority',
      'value': {
        'name': this._name,
        'signer': this._signer,
        'owner': this._owner
      }
    });
  }
}

/**
 * Set name message.
 */
export class MsgSetName {

  /**
   * @constructor
   * @param {string} wrn
   * @param {string} id
   * @param {string} owner
   */
  constructor(wrn, id, owner) {
    assert(wrn);
    assert(id);
    assert(owner);

    this._wrn = wrn;
    this._id = id;
    this._owner = owner;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'nameservice/SetName',
      'value': {
        'wrn': this._wrn,
        'id': this._id,
        'signer': this._owner
      }
    });
  }
}

/**
 * Delete name message.
 */
export class MsgDeleteName {

  /**
   * @constructor
   * @param {string} wrn
   * @param {string} owner
   */
  constructor(wrn, owner) {
    assert(wrn);
    assert(owner);

    this._wrn = wrn;
    this._owner = owner;
  }

  /**
   * Serialize Message.
   */
  serialize() {
    return Util.sortJSON({
      'type': 'nameservice/DeleteName',
      'value': {
        'wrn': this._wrn,
        'signer': this._owner
      }
    });
  }
}
