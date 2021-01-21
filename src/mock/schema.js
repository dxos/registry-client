//
// Copyright 2020 DXOS.org
//

import { makeExecutableSchema } from '@graphql-tools/schema';

import schemaDefs from '@wirelineio/wns-schema/gql/schema.graphql';

import { MemoryStore } from './store';
import { Resolvers } from './resolvers';

/**
 * Create mock GQL schema.
 * @param {array} data Records to init server with.
 * @return {GraphQLSchema}
 */
export const createSchema = async (data) => {
  const memoryStore = new MemoryStore();
  await memoryStore.init(data);

  const schema = makeExecutableSchema({
    typeDefs: [schemaDefs],
    resolvers: new Resolvers(memoryStore).getMap(),
    inheritResolversFromInterfaces: true
  });
  return schema;
};
