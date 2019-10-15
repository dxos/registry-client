//
// Copyright 2019 Wireline, Inc.
//

import yaml from 'node-yaml';
import semver from 'semver';

export const ensureUpdatedConfig = async path => {
  const conf = await yaml.read(path);
  conf.record.attributes.version = semver.inc(conf.record.attributes.version, 'patch');
  await yaml.write(path, conf);

  return conf;
};

export const getBaseConfig = async path => {
  const conf = await yaml.read(path);
  conf.record.attributes.version = '0.0.1';

  return conf;
};
