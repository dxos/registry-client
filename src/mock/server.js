//
// Copyright 2019 Wireline, Inc.
//

import getPort from 'get-port';
import { ApolloServer, makeExecutableSchema } from 'apollo-server';

import schemaDefs from '@wirelineio/wns-schema/gql/schema.graphql';
import extensionDefs from '@wirelineio/wns-schema/gql/extensions.graphql';

import { MemoryStore } from './store';
import { Resolvers } from './resolvers';

/**
 * Create a mock GQL server.
 * @return {ApolloServer}
 */
export const createMockServer = async () => {
  const memoryStore = new MemoryStore();
  await memoryStore.init();

  const schema = makeExecutableSchema({
    typeDefs: [schemaDefs, extensionDefs],
    resolvers: new Resolvers(memoryStore).getMap(),
    inheritResolversFromInterfaces: true
  });
  return new ApolloServer({ schema });
};

export const startMockServer = async () => {
  const mockServer = await createMockServer();
  const serverInfo = await mockServer.listen(await getPort());
  return { mockServer, serverInfo };
};
