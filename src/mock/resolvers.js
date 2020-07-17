//
// Copyright 2019 Wireline, Inc.
//

import { Util } from '../util';

import mockStatus from './data/status.json';

// TODO(egorgripasov): any better logic?
const DEFAULT_OWNER = '6ee3328f65c8566cd5451e49e97a767d10a8adf7';

// Dummy bond ID and expiry time for in-mem implementation.
const BOND_ID = '8e340dd7cf6fc91c27eeefce9cca1406c262e93fd6f3a4f3b1e99b01161fcef3';
const EXPIRY_TIME = '2050-12-30T06:56:35.084960000';

const CREATE_TIME = '2020-01-30T06:56:35.084960000';

export class Resolvers {
  /**
   * @constructor
   * @param {MemoryStore} memoryStore
   */
  constructor(memoryStore) {
    this._memoryStore = memoryStore;
  }

  /**
   * Get resolvers.
   */
  getMap() {
    return {
      Query: {
        getStatus: async () => (mockStatus),

        queryRecords: async (_, { attributes = [] }) => {
          const filterAttributes = Util.fromGQLAttributes(attributes, true);
          return this._memoryStore.queryRecords(filterAttributes);
        },

        getRecordsByIds: async (_, { ids }) => this._memoryStore.getRecordsByIds(ids)
      },

      Mutation: {
        insertRecord: async (_, { attributes }) => {
          const inputRecord = Util.fromGQLAttributes(attributes, true);
          const [record] = await this._memoryStore.insertRecords([inputRecord]);
          return record;
        }
      },

      Record: {
        owners: () => [DEFAULT_OWNER],

        attributes: (record) => {
          const { id, ...attributes } = record;
          return Util.toGQLAttributes(attributes);
        },

        references: async (record) => {
          const referenceIds = Object.values(record).filter(value => typeof (value) === 'object').map(value => value.id);
          return this._memoryStore.getRecordsByIds(referenceIds);
        },

        bondId: () => BOND_ID,

        createTime: () => CREATE_TIME,

        expiryTime: () => EXPIRY_TIME
      }
    };
  }
}
