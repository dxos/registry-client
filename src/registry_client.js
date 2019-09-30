//
// Copyright 2019 Wireline, Inc.
//

// TODO(egorgripasov): replace with appolo client + fragments.
import graphql from 'graphql.js';
import { get, set } from 'lodash';

import { Util } from './util';

/**
 * Registry
 */
export class RegistryClient {
  static DEFAULT_ENDPOINT = 'https://registry-testnet.wireline.ninja/query';

  /**
   * New Client.
   * @param {string} endpoint
   */
  constructor(endpoint) {
    this.endpoint = endpoint || RegistryClient.DEFAULT_ENDPOINT;
    this.graph = graphql(this.endpoint, {
      method: 'POST',
      asJSON: true
    });
  }

  async _getResult(query, key, modifier = null) {
    let result = await query;
    if (result && result[key] && result[key].length && result[key][0] !== null) {
      if (modifier) {
        return modifier(result[key]);
      }
      return result[key];
    }
    return [];
  }

  _prepareAttributes(path) {
    return rows => {
      let result = rows.map(r => {
        set(r, path, Util.fromGQLAttributes(get(r, path)));
        return r;
      });
      return result;
    }
  }

  /**
   * Fetch Accounts.
   * @param {array} addresses
   */
  async getAccounts(addresses) {
    console.assert(addresses);
    console.assert(addresses.length);

    let query = `query ($addresses: [String!]) {
      getAccounts(addresses: $addresses) {
        address
        pubKey
        number
        sequence
        balance {
          type
          quantity
        }
      }
    }`;

    let variables = {
      addresses
    };

    return this._getResult(this.graph(query)(variables), 'getAccounts');
  }

  async getRecordsByIds(ids) {
    console.assert(ids);
    console.assert(ids.length);

    let query = `query ($ids: [String!]) {
      getRecordsByIds(ids: $ids) {
        id
        type
        owner
        attributes {
          key
          value {
            null
            int
            float
            string
            boolean
          }
        }
      }
    }`;

    let variables = {
      ids
    };

    return this._getResult(this.graph(query)(variables), 'getRecordsByIds', this._prepareAttributes('attributes'));
  }

  /**
   * Get records by attributes.
   * @param {object} attributes
   */
  async getRecordsByAttributes(attributes) {
    if (!attributes) {
      attributes = {};
    }

    let query = `query ($attributes: [KeyValueInput!]) {
      getRecordsByAttributes(attributes: $attributes) {
        id
        type
        owner
        attributes {
          key
          value {
            null
            int
            float
            string
            boolean
          }
        }
      }
    }`;

    let variables = {
      attributes: Util.toGQLAttributes(attributes)
    };

    return this._getResult(this.graph(query)(variables), 'getRecordsByAttributes', this._prepareAttributes('attributes'));
  }

  /**
   * Get bots by attributes.
   * @param {object} attributes
   */
  async getBotsByAttributes(attributes) {
    if (!attributes) {
      attributes = {};
    }

    let query = `query ($attributes: [KeyValueInput!]) {
      getBotsByAttributes(attributes: $attributes) {
        name
        accessKey
        record {
          id
          type
          owner
          attributes {
            key
            value {
              null
              int
              float
              string
              boolean
            }
          }
        }
      }
    }`;

    let variables = {
      attributes: Util.toGQLAttributes(attributes)
    };

    return this._getResult(this.graph(query)(variables), 'getBotsByAttributes', this._prepareAttributes('record.attributes'));
  }

  /**
   * Submit transaction.
   * @param {string} tx
   */
  async submit(tx) {
    console.assert(tx);

    let mutation = `mutation ($tx: String!) {
      submit(tx: $tx)
    }`;

    let variables = {
      tx
    };

    return this.graph(mutation)(variables);
  }
}
