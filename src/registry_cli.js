//
// Copyright 2019 Wireline, Inc.
//

import graphql from 'graphql.js';

/**
 * Registry
 */
export class RegistryCli {
  static DEFAULT_ENDPOINT = 'http://localhost:8080/query';

  constructor(endpoint) {
    this.endpoint = endpoint || RegistryCli.DEFAULT_ENDPOINT;
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

  getBots(name) {
    throw new Error('Not implemented.');
  }

  getPseudonyms(name) {
    throw new Error('Not implemented.');
  }

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