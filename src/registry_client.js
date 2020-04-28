//
// Copyright 2019 Wireline, Inc.
//

// TODO(egorgripasov): replace with appolo client + fragments.
import graphql from 'graphql.js';
import get from 'lodash.get';
import set from 'lodash.set';
import assert from 'assert';

import { Util } from './util';

const attributeField = `
  attributes {
    key
    value {
      null
      int
      float
      string
      boolean
      json
      reference {
        id
      }
    }
  }
`;

// TODO(egorgripasov): Reference attributes & recursive fetch.
const refsField = `
  references {
    id
    type
    name
    version
  }
`;

/**
 * Registry
 */
export class RegistryClient {

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
    assert(endpoint);

    this._endpoint = endpoint;
    this._graph = graphql(this._endpoint, {
      method: 'POST',
      asJSON: true
    });
  }

  /**
   * Get server status.
   */
  async getStatus() {
    const query = `query {
      getStatus {
        version
        node {
          id
          network
          moniker
        }
        sync {
          latest_block_hash
          latest_block_height
          latest_block_time
          catching_up
        }
        validator {
          address
          voting_power
        }
        validators {
          address
          voting_power
          proposer_priority
        }
        num_peers
        peers {
          node {
            id
            network
            moniker
          }
          is_outbound
          remote_ip
        }
        disk_usage
      }
    }`;

    const { getStatus: status } = await this._graph(query)();

    return status;
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

    return RegistryClient.getResult(this._graph(query)(variables), 'getAccounts');
  }

  /**
   * Get records by ids.
   * @param {array} ids
   * @param {boolean} refs
   */
  async getRecordsByIds(ids, refs = false) {
    console.assert(ids);
    console.assert(ids.length);

    const query = `query ($ids: [String!]) {
      getRecordsByIds(ids: $ids) {
        id
        type
        name
        version
        owners
        bondId
        createTime
        expiryTime
        ${attributeField}
        ${refs ? refsField : ''}
      }
    }`;

    const variables = {
      ids
    };

    return RegistryClient.getResult(this._graph(query)(variables), 'getRecordsByIds', RegistryClient.prepareAttributes('attributes'));
  }

  /**
   * Get records by attributes.
   * @param {object} attributes
   * @param {boolean} refs
   */
  async queryRecords(attributes, refs = false) {
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
        bondId
        createTime
        expiryTime
        ${attributeField}
        ${refs ? refsField : ''}
      }
    }`;

    const variables = {
      attributes: Util.toGQLAttributes(attributes)
    };

    return RegistryClient.getResult(this._graph(query)(variables), 'queryRecords', RegistryClient.prepareAttributes('attributes'));
  }

  /**
   * Resolve records by refs.
   * @param {array} references
   * @param {boolean} refs
   */
  async resolveRecords(references, refs = false) {
    console.assert(references.length);

    const query = `query ($refs: [String!]) {
      resolveRecords(refs: $refs) {
        id
        type
        name
        version
        owners
        bondId
        createTime
        expiryTime
        ${attributeField}
        ${refs ? refsField : ''}
      }
    }`;

    const variables = {
      refs: references
    };

    return RegistryClient.getResult(this._graph(query)(variables), 'resolveRecords', RegistryClient.prepareAttributes('attributes'));
  }

  /**
   * Get bonds by ids.
   * @param {array} ids
   */
  async getBondsByIds(ids) {
    console.assert(ids);
    console.assert(ids.length);

    const query = `query ($ids: [String!]) {
      getBondsByIds(ids: $ids) {
        id
        owner
        balance {
          type
          quantity
        }
      }
    }`;

    const variables = {
      ids
    };

    return RegistryClient.getResult(this._graph(query)(variables), 'getBondsByIds');
  }

  /**
   * Get records by attributes.
   * @param {object} attributes
   */
  async queryBonds(attributes = {}) {
    const query = `query ($attributes: [KeyValueInput!]) {
      queryBonds(attributes: $attributes) {
        id
        owner
        balance {
          type
          quantity
        }
      }
    }`;

    const variables = {
      attributes: Util.toGQLAttributes(attributes)
    };

    return RegistryClient.getResult(this._graph(query)(variables), 'queryBonds');
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

    return this._graph(mutation)(variables);
  }

  /**
   * Insert record.
   * @param {object} attributes
   */
  async insertRecord(attributes) {
    console.assert(Object.keys(attributes).length);

    const query = `mutation insertRecord($attributes: [KeyValueInput]!) {
      insertRecord(attributes: $attributes) {
        id
        type
        ${attributeField}
      }
    }`;

    const variables = {
      attributes: Util.toGQLAttributes(attributes)
    };

    return RegistryClient.getResult(this._graph(query)(variables), 'insertRecord', RegistryClient.prepareAttributes('attributes'));
  }
}
