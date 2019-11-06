//
// Copyright 2019 Wireline, Inc.
//

import { Util } from '../util';

const WRN_TYPE_TO_GQL_MAP = {
  'wrn:bot': 'Bot',
  'wrn:pad': 'Pad',
  'wrn:protocol': 'Protocol'
};

// TODO(egorgripasov): any better logic?
const DEFAULT_OWNER = '6ee3328f65c8566cd5451e49e97a767d10a8adf7';

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
        queryRecords: async (_, { attributes = [] }) => {
          const filterAttributes = Util.fromGQLAttributes(attributes, true);
          return this._memoryStore.queryRecords(filterAttributes);
        },

        resolveRecords: async (_, { refs = [] }) => this._memoryStore.resolveRecords(refs),

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

        extension: (record) => record,

        references: async (record) => {
          const referenceIds = Object.values(record).filter(value => typeof (value) === 'object').map(value => value.id);
          return this._memoryStore.getRecordsByIds(referenceIds);
        }
      },

      Extension: {
        __resolveType: (obj) => {
          const resolvedType = WRN_TYPE_TO_GQL_MAP[obj.type];
          return resolvedType || 'UnknownExtension';
        }
      }
    };
  }
}
