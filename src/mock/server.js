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
export const createMockServer = async (data) => {
  const schema = await createSchema(data);
  return new ApolloServer({ schema });
};

export const startMockServer = async (data) => {
  const mockServer = await createMockServer(data);
  const serverInfo = await mockServer.listen(await getPort());
  return { mockServer, serverInfo };
};
