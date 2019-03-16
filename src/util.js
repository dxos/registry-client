//
// Copyright 2019 Wireline, Inc.
//

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
      for (var i = 0; i < object.length; i++) {
        object[i] = Util.sortJSON(object[i]);
      }
      return object;
    } else if (typeof object != "object" || object === null) return object;
  
    var keys = Object.keys(object);
    keys = keys.sort();
    var newObject = {};
    for (var i = 0; i < keys.length; i++) {
      newObject[keys[i]] = Util.sortJSON(object[keys[i]])
    }
    return newObject;
  }
}
