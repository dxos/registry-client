//
// Copyright 2019 Wireline, Inc.
//

if (typeof btoa === 'undefined') {
  global.btoa = function(str) {
    return new Buffer(str, 'binary').toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function(b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString('binary');
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
    } else if (typeof object != 'object' || object === null) return object;

    let keys = Object.keys(object);
    keys = keys.sort();
    let newObject = {};
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
    let vars = [];
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        let type = typeof key;
        if (object[key] === null) {
          vars.push({ key, value: { 'null': true }});
        } else if (type === 'number') {
          type = (object[key] % 1 === 0) ? 'int' : 'float';
          vars.push({ key, value: { [type]: object[key] }});
        } else if (type === 'string') {
          vars.push({ key, value: { 'string': object[key] }});
        } else if (type === 'boolean') {
          vars.push({ key, value: { 'boolean': object[key] }});
        }
      }
    }
    return vars;
  }

  /**
   * Unmarshal attributes array to object.
   * @param {array} attributes
   */
  static fromGQLAttributes(attributes) {
    let res = {};
    for (let attr of attributes) {
      if (attr.value.null) {
        res[attr.key] = null;
      } else {
        let { values, null:n, ...types } = attr.value;
        let value = Object.values(types).find(v => v !== null);
        res[attr.key] = value;
      }
    }
    return res;
  }
}
