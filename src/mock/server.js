//
// Copyright 2019 Wireline, Inc.
//

import getPort from 'get-port';
import { ApolloServer } from 'apollo-server';

import { createSchema } from './schema';

/**
 * Create a mock GQL server.
 * @return {ApolloServer}
 */
export const createMockServer = async () => {
  const schema = await createSchema();
  return new ApolloServer({ schema });
};

export const startMockServer = async () => {
  const mockServer = await createMockServer();
  const serverInfo = await mockServer.listen(await getPort());
  return { mockServer, serverInfo };
};
