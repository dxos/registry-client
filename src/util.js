//
// Copyright 2019 Wireline, Inc.
//

import canonicalStringify from 'canonical-json';
import multihashing from 'multihashing-async';
import CID from 'cids';

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return Buffer.from(str, 'binary').toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return Buffer.from(b64Encoded, 'base64').toString('binary');
  };
}

/**
 * Utils
 */
export class Util {
  /**
   * Sorts JSON object.
   * @param {object} object
   */
  static sortJSON(object) {
    if (object instanceof Array) {
      for (let i = 0; i < object.length; i++) {
        object[i] = Util.sortJSON(object[i]);
      }
      return object;
    }
    if (typeof object !== 'object' || object === null) return object;

    let keys = Object.keys(object);
    keys = keys.sort();
    const newObject = {};
    for (let i = 0; i < keys.length; i++) {
      newObject[keys[i]] = Util.sortJSON(object[keys[i]]);
    }
    return newObject;
  }

  /**
   * Marshal object into gql 'attributes' variable.
   * @param {object} object
   */
  static toGQLAttributes(object) {
    const vars = [];
    Object.keys(object).forEach(key => {
      let type = typeof object[key];
      if (object[key] === null) {
        vars.push({ key, value: { 'null': true } });
      } else if (type === 'number') {
        type = (object[key] % 1 === 0) ? 'int' : 'float';
        vars.push({ key, value: { [type]: object[key] } });
      } else if (type === 'string') {
        vars.push({ key, value: { 'string': object[key] } });
      } else if (type === 'boolean') {
        vars.push({ key, value: { 'boolean': object[key] } });
      } else if (type === 'object') {
        const nestedObject = object[key];
        if (nestedObject.type && nestedObject.type === 'wrn:reference') {
          vars.push({ key, value: { 'reference': { id: nestedObject.id } } });
        }
      }
    });
    return vars;
  }

  /**
   * Unmarshal attributes array to object.
   * @param {array} attributes
   * @param {boolean} addRefType
   */
  static fromGQLAttributes(attributes, addRefType = false) {
    const res = {};
    attributes.forEach(attr => {
      if (attr.value.null) {
        res[attr.key] = null;
      } else if (attr.value.json) {
        res[attr.key] = JSON.parse(attr.value.json);
      } else {
        const { values, null: n, ...types } = attr.value;
        const value = Object.values(types).find(v => v !== null);
        if (typeof (value) === 'object' && types.reference) {
          if (addRefType) {
            value.type = 'wrn:reference';
          }
        }
        res[attr.key] = value;
      }
    });
    return res;
  }

  /**
   * Get record content ID.
   * @param {object} record
   * @returns {string}
   */
  static async getContentId(record) {
    const content = Buffer.from(canonicalStringify(record));
    const hash = await multihashing(content, 'sha2-256');
    return new CID(hash).toString();
  }
}
