//
// Copyright 2019 Wireline, Inc.
//

import yargs from 'yargs';

import { createMockServer } from './server';

const { argv } = yargs
  .option('host', {
    default: '127.0.0.1',
    describe: 'GQL server host',
    type: 'string'
  })
  .option('port', {
    default: 4000,
    describe: 'GQL server port',
    type: 'number'
  });

createMockServer()
  .then(server => server.listen(argv.port, argv.host))
  .then(({ url }) => {
    console.log('Mock server running on', url);
  });
