//
// Copyright 2019 Wireline, Inc.
//

import isEqual from 'lodash.isequal';
import semver from 'semver';

import { Util } from '../util';

import records from './data/records';

/**
 * In-memory store.
 */
export class MemoryStore {
  _records = new Map();

  _regordGroups = new Map();

  _initialized = false;

  _getVersions(type, name) {
    const id = `${type}:${name}`;
    let map = this._regordGroups.get(id);
    if (!map) {
      map = new Map();
      this._regordGroups.set(id, map);
    }

    return map;
  }

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
    const { name, type, version, ...rest } = attributes;
    let res = await this._resolveEntities(name, type, version);

    res = res
      .filter(record => {
        /* eslint-disable no-restricted-syntax */
        for (const attr in rest) {
          if (!isEqual(record[attr], rest[attr])) {
            return false;
          }
        }
        return true;
      });
    return res;
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
        const records = await this.queryRecords({ ...ref, type: `wrn:${ref.type}` });
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
        const { name, type, version } = record;
        this._records.set(id, record);
        this._getVersions(type, name).set(version, { name, type, version });
        return { id, ...record };
      }
      return { id, ...this._records.get(id) };
    });
    return result;
  }

  async _resolveEntities(name, type, version) {
    let res = Array.from(this._records).map(([id, record]) => ({ id, ...record }));
    let entities = Array.from(this._regordGroups).map(([, record]) => record);

    if (!version || version === 'latest') {
      // Only latest version of every entity.
      entities = entities.map(entityMap => {
        const keys = Array.from(entityMap.keys());
        const maxKey = keys.reduce((p, v) => (semver.gt(p, v) ? p : v));
        return entityMap.get(maxKey);
      });
    } else if (version && version.match(/^\d/)) {
      // Specific version.
      const newEntities = [];
      entities.forEach(entityMap => {
        if (entityMap.has(version)) {
          newEntities.push(entityMap.get(version));
        }
      });
      entities = newEntities;
    } else if (version && version.match(/^~|\^/)) {
      // Latest semver version.
      const newEntities = [];
      entities.forEach(entityMap => {
        const versions = Array.from(entityMap.keys());
        const maxSatisfied = semver.maxSatisfying(versions, version, true);
        if (maxSatisfied) {
          newEntities.push(entityMap.get(maxSatisfied));
        }
      });
      entities = newEntities;
    } else {
      // All versions.
      const newEntities = [];
      entities.forEach(entityMap => {
        Array.from(entityMap).forEach(([, record]) => {
          newEntities.push(record);
        });
      });
      entities = newEntities;
    }

    if (name) {
      entities = entities.filter(e => e.name === name);
    }

    if (type) {
      entities = entities.filter(e => e.type === type);
    }

    // Get only those records where type, name and version matches.
    res = res.filter(record => entities.find(
      entity => entity.name === record.name && entity.type === record.type && entity.version === record.version
    ));
    return res;
  }
}
