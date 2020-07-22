//
// Copyright 2019 Wireline, Inc.
//

import { graphql } from 'graphql';
import graphqlClient from 'graphql.js';
import get from 'lodash.get';
import set from 'lodash.set';
import assert from 'assert';

import { Util } from './util';

const DEFAULT_LOG_NUM_LINES = 50;

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
  }
`;

const historyFields = `
  history {
    id
    height
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
   * @param {object} options
   */
  constructor(endpoint, options) {
    const { schema } = options;
    assert(endpoint || schema);

    this._endpoint = endpoint;
    if (schema) {
      this._graph = source => async variableValues => {
        const { data } = await graphql({ schema, source, variableValues });
        return data;
      };
    } else {
      this._graph = graphqlClient(this._endpoint, {
        method: 'POST',
        asJSON: true
      });
    }
  }

  /**
   * Run arbitrary query.
   * @param {string} query
   * @param {object} variables
   */
  async query(query, variables) {
    assert(query);

    return this._graph(query)(variables);
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
   * Get logs.
   */
  async getLogs(count = DEFAULT_LOG_NUM_LINES) {
    const query = `query ($count: Int) {
      getLogs(count: $count)
    }`;

    const variables = {
      count
    };

    const { getLogs: logs } = await this._graph(query)(variables);

    return logs;
  }

  /**
   * Fetch Accounts.
   * @param {array} addresses
   */
  async getAccounts(addresses) {
    assert(addresses);
    assert(addresses.length);

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
    assert(ids);
    assert(ids.length);

    const query = `query ($ids: [String!]) {
      getRecordsByIds(ids: $ids) {
        id
        names
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
   * @param {boolean} all
   * @param {boolean} refs
   */
  async queryRecords(attributes, all = false, refs = false) {
    if (!attributes) {
      attributes = {};
    }

    const query = `query ($attributes: [KeyValueInput!], $all: Boolean) {
      queryRecords(attributes: $attributes, all: $all) {
        id
        names
        owners
        bondId
        createTime
        expiryTime
        ${attributeField}
        ${refs ? refsField : ''}
      }
    }`;

    const variables = {
      attributes: Util.toGQLAttributes(attributes),
      all
    };

    return RegistryClient.getResult(this._graph(query)(variables), 'queryRecords', RegistryClient.prepareAttributes('attributes'));
  }

  /**
   * Lookup authorities by names.
   * @param {array} names
   */
  async lookupAuthorities(names) {
    assert(names.length);

    const query = `query ($names: [String!]) {
      lookupAuthorities(names: $names) {
        meta {
          height
        }
        records {
          ownerAddress
          ownerPublicKey
          height
        }
      }
    }`;

    const variables = {
      names
    };

    const result = await this._graph(query)(variables);

    return result['lookupAuthorities'];
  }

  /**
   * Lookup names.
   * @param {array} names
   * @param {boolean} history
   */
  async lookupNames(names, history = false) {
    assert(names.length);

    const query = `query ($names: [String!]) {
      lookupNames(names: $names) {
        meta {
          height
        }
        records {
          latest {
            id
            height
          }
          ${history ? historyFields : ''}
        }
      }
    }`;

    const variables = {
      names
    };

    const result = await this._graph(query)(variables);

    return result['lookupNames'];
  }

  /**
   * Resolve names to records.
   * @param {array} names
   * @param {boolean} refs
   */
  async resolveNames(names, refs = false) {
    assert(names.length);

    const query = `query ($names: [String!]) {
      resolveNames(names: $names) {
        meta {
          height
        }
        records {
          id
          names
          owners
          bondId
          createTime
          expiryTime
          ${attributeField}
          ${refs ? refsField : ''}
        }
      }
    }`;

    const variables = {
      names
    };

    const result = (await this._graph(query)(variables))['resolveNames'];
    result.records = RegistryClient.prepareAttributes('attributes')(result.records);

    return result;
  }

  /**
   * Get bonds by ids.
   * @param {array} ids
   */
  async getBondsByIds(ids) {
    assert(ids);
    assert(ids.length);

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
    assert(tx);

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
    assert(Object.keys(attributes).length);

    const query = `mutation insertRecord($attributes: [KeyValueInput]!) {
      insertRecord(attributes: $attributes) {
        id
        ${attributeField}
      }
    }`;

    const variables = {
      attributes: Util.toGQLAttributes(attributes)
    };

    const recordResult = RegistryClient.getResult(this._graph(query)(variables), 'insertRecord', RegistryClient.prepareAttributes('attributes'));
    return { ...recordResult, 'deliver_tx': { log: '{}', events: [] } };
  }
}
