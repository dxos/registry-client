//
// Copyright 2020 DXOS.org
//

import canonicalStringify from 'canonical-json';
import multihashing from 'multihashing-async';
import CID from 'cids';

if (typeof btoa === 'undefined') {
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}

if (typeof atob === 'undefined') {
  global.atob = (b64Encoded) => Buffer.from(b64Encoded, 'base64').toString('binary');
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
        if (nestedObject['/'] !== undefined) {
          vars.push({ key, value: { 'reference': { id: nestedObject['/'] } } });
        }
      }
    });
    return vars;
  }

  /**
   * Unmarshal attributes array to object.
   * @param {array} attributes
   */
  static fromGQLAttributes(attributes = []) {
    const res = {};
    attributes.forEach(attr => {
      if (attr.value.null) {
        res[attr.key] = null;
      } else if (attr.value.json) {
        res[attr.key] = JSON.parse(attr.value.json);
      } else if (attr.value.reference) {
        // Convert GQL reference to IPLD style link.
        const ref = attr.value.reference;
        res[attr.key] = { '/': ref.id };
      } else {
        const { values, null: n, ...types } = attr.value;
        const value = Object.values(types).find(v => v !== null);
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
