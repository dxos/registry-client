//
// Copyright 2019 Wireline, Inc.
//

import graphql from 'graphql.js';

/**
 * Registry
 */
export class RegistryClient {
  static DEFAULT_ENDPOINT = 'http://localhost:8080/query';

  /**
   * New Client.
   * @param {string} endpoint
   */
  constructor(endpoint) {
    this.endpoint = endpoint || RegistryClient.DEFAULT_ENDPOINT;
    this.graph = graphql(this.endpoint, {
      method: "POST",
      asJSON: true
    })
  }

  async _getResult(query, key) {
    let result = await query;
    if (result && result[key] && result[key].length && result[key][0] !== null) {
      return result[key];
    }
    return [];
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
        num
        seq
        coins {
          denom
          amount
        }
      }
    }`

    let variables = {
      addresses
    }

    return this._getResult(this.graph(query)(variables), 'getAccounts');
  }

  /**
   * Fetch Resources.
   * @param {array} ids
   */
  async getResources(ids) {
    console.assert(ids);
    console.assert(ids.length);

    let query = `query ($ids: [String!]) {
      getResources(ids: $ids) {
        id
        type
        owner {
          id
          address
        }
        systemAttributes
        attributes
        links {
          id
          attributes
        }
      }
    }`

    let variables = {
      ids
    }

    return this._getResult(this.graph(query)(variables), 'getResources');
  }

  /**
   * List Resources.
   */
  async listResources() {
    let query = `query {
      listResources {
        id
        type
        owner {
          id
          address
        }
        systemAttributes
        attributes
        links {
          id
          attributes
        }
      }
    }`

    return this._getResult(this.graph(query)(variables), 'listResources');
  }

  /**
   * Fetch Bots.
   * @param {array} name
   * @param {string} namespace
   */
  getBots(name, namespace) {
    name = name || [];

    let query = `query ($namespace: String, $name: [String!]) {
      getBots(namespace: $namespace, name: $name) {
        resource {
          id
          type
          owner {
            id
            address
          }
          systemAttributes
          attributes
          links {
            id
            attributes
          }
        }
        name
        dsinvite
      }
    }`

    let variables = {
      name,
      namespace
    }

    return this._getResult(this.graph(query)(variables), 'getBots');
  }

  /**
   * Fetch Pseudonyms.
   * @param {array} name
   * @param {string} namespace
   */
  getPseudonyms(name, namespace) {
    name = name || [];

    let query = `query ($namespace: String, $name: [String!]) {
      getPseudonyms(namespace: $namespace, name: $name) {
        resource {
          id
          type
          owner {
            id
            address
          }
          systemAttributes
          attributes
          links {
            id
            attributes
          }
        }
        name
        dsinvite
      }
    }`

    let variables = {
      name,
      namespace
    }

    return this._getResult(this.graph(query)(variables), 'getPseudonyms');
  }

  /**
   * Broadcast transaction.
   * @param {string} tx
   */
  async broadcastTxCommit(tx) {
    console.assert(tx);

    let mutation = `mutation ($tx: String!) {
      broadcastTxCommit(tx: $tx)
    }`

    let variables = {
      tx
    }

    return this.graph(mutation)(variables);
  }
}
