//
// Copyright 2020 DXOS.org
//

import isEqual from 'lodash.isequal';

import { Util } from '../util';

import records from './data/records.json';

/**
 * In-memory store.
 */
export class MemoryStore {
  _records = new Map();

  _initialized = false;

  /**
   * Initialize store.
   * @param {array} data Records to init server with.
   * @return {Promise<void>}
   * @private
   */
  async init(data) {
    if (!this._initialized) {
      await this.insertRecords(data || records);
      this._initialized = true;
    }
  }

  /**
   * Query records.
   * @param {object} attributes Properties to filter by.
   * @return {Promise<[]>}
   */
  async queryRecords(attributes = {}) {
    return Array.from(this._records).map(([id, record]) => ({ id, ...record }))
      .filter(record => {
        /* eslint-disable no-restricted-syntax */
        for (const attr in attributes) {
          if (!isEqual(record[attr], attributes[attr])) {
            return false;
          }
        }
        return true;
      });
  }

  /**
   * Resolve records.
   * @param {array} refs
   */
  async resolveRecords(refs = []) {
    const result = refs
      .map(ref => {
        const [ entity, version = 'latest' ] = ref.split('#');
        const [ , type, name ] = entity.split(':');
        return { type, name, version };
      })
      .filter(ref => ref.type && ref.name && ref.version)
      .map(async ref => {
        const records = await this.queryRecords({ ...ref, type: `${ref.type}` });
        return records[0];
      })
      .filter(ref => ref);
    return result;
  }

  /**
   * Get records by ids.
   * @param {string[]} ids
   * @return {Promise<[]>}
   */
  async getRecordsByIds(ids) {
    const recordsToReturn = [];
    ids.forEach(id => {
      const record = this._records.get(id);
      if (record) {
        record.id = id;
        recordsToReturn.push(record);
      }
    });

    return recordsToReturn;
  }

  /**
   * Add records.
   * @param {array} records
   */
  async insertRecords(records) {
    const result = records.map(async record => {
      const id = await Util.getContentId(record);
      if (!this._records.has(id)) {
        this._records.set(id, record);
      }

      return { id, ...record };
    });

    return Promise.all(result);
  }
}
