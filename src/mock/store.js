//
// Copyright 2019 Wireline, Inc.
//

import isEqual from 'lodash.isequal';

import { Util } from '../util';

import records from './data/records';

/**
 * In-memory store.
 */
export class MemoryStore {
  _records = new Map();

  _initialized = false;

  /**
   * Initialize store.
   * @return {Promise<void>}
   * @private
   */
  async init() {
    if (!this._initialized) {
      await this.insertRecords(records);
      this._initialized = true;
    }
  }

  /**
   * Query records.
   * @param {object} attributes Properties to filter by.
   * @return {Promise<[]>}
   */
  async queryRecords(attributes = {}) {
    const res = Array.from(this._records)
      .map(([id, record]) => ({ id, ...record }))
      .filter(record => {
        /* eslint-disable no-restricted-syntax */
        for (const attr in attributes) {
          if (!isEqual(record[attr], attributes[attr])) {
            return false;
          }
        }
        return true;
      });
    return res;
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
        return { id, ...record };
      }
      return { id, ...this._records.get(id) };
    });
    return result;
  }
}
