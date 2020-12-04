//
// Copyright 2019 Wireline, Inc.
//

import assert from 'assert';
import canonicalStringify from 'canonical-json';

import { Transaction } from './types';

/**
 * Generate a cosmos-sdk transaction.
 * @param {object} message
 * @param {object} account
 * @param {string} accountNumber
 * @param {string} accountSequence
 * @param {string} chainID
 * @param {object} fee
 */
export const createTransaction = (message, account, accountNumber, accountSequence, chainID, fee) => {
  assert(message);
  assert(account);
  assert(accountNumber);
  assert(accountSequence);
  assert(chainID);
  assert(fee);

  // 1. Compose StdSignDoc.
  const stdSignDoc = {
    account_number: accountNumber,
    chain_id: chainID,
    fee,
    memo: '',
    msgs: [message.serialize()],
    sequence: accountSequence
  };

  // 2. Calculate signature.
  const transactionDataToSign = Buffer.from(canonicalStringify(stdSignDoc));
  const transactionSig = account.sign(transactionDataToSign);

  const transaction = new Transaction(message, account, fee, transactionSig, chainID);
  return transaction.serialize();
};
