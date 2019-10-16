//
// Copyright 2019 Wireline, Inc.
//

// TODO(egorgripasov): replace with appolo client + fragments.
import graphql from 'graphql.js';
import { get } from 'lodash.get';
import { set } from 'lodash.set';

import { Util } from './util';

/**
 * Registry
 */
export class RegistryClient {
  static DEFAULT_ENDPOINT = 'https://registry-testnet.wireline.ninja/query';

  /**
   * Get query result.
   * @param {object} query
   * @param {string} key
   * @param {function} modifier
   */
  static async getResult(query, key, modifier = null) {
    const result = await query;
    if (result && result[key] && result[key].length && result[key][0] !== null) {
      if (modifier) {
        return modifier(result[key]);
      }
      return result[key];
    }
    return [];
  }

  /**
   * Prepare response attributes.
   * @param {string} path
   */
  static prepareAttributes(path) {
    return rows => {
      const result = rows.map(r => {
        set(r, path, Util.fromGQLAttributes(get(r, path)));
        return r;
      });
      return result;
    };
  }

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

  /**
   * Fetch Accounts.
   * @param {array} addresses
   */
  async getAccounts(addresses) {
    console.assert(addresses);
    console.assert(addresses.length);

    const query = `query ($addresses: [String!]) {
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

    const variables = {
      addresses
    };

    return RegistryClient.getResult(this.graph(query)(variables), 'getAccounts');
  }

  async getRecordsByIds(ids) {
    console.assert(ids);
    console.assert(ids.length);

    const query = `query ($ids: [String!]) {
      getRecordsByIds(ids: $ids) {
        id
        type
        name
        version
        owners
        attributes {
          key
          value {
            null
            int
            float
            string
            boolean
            reference {
              id
            }
          }
        }
      }
    }`;

    const variables = {
      ids
    };

    return RegistryClient.getResult(this.graph(query)(variables), 'getRecordsByIds', RegistryClient.prepareAttributes('attributes'));
  }

  /**
   * Get records by attributes.
   * @param {object} attributes
   */
  async queryRecords(attributes) {
    if (!attributes) {
      attributes = {};
    }

    const query = `query ($attributes: [KeyValueInput!]) {
      queryRecords(attributes: $attributes) {
        id
        type
        name
        version
        owners
        attributes {
          key
          value {
            null
            int
            float
            string
            boolean
            reference {
              id
            }
          }
        }
      }
    }`;

    const variables = {
      attributes: Util.toGQLAttributes(attributes)
    };

    return RegistryClient.getResult(this.graph(query)(variables), 'queryRecords', RegistryClient.prepareAttributes('attributes'));
  }

  /**
   * Submit transaction.
   * @param {string} tx
   */
  async submit(tx) {
    console.assert(tx);

    const mutation = `mutation ($tx: String!) {
      submit(tx: $tx)
    }`;

    const variables = {
      tx
    };

    return this.graph(mutation)(variables);
  }
}
