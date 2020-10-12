//
// Copyright 2020 Wireline, Inc.
//

import { Registry, Account, createBid } from './index';
import { getConfig } from './testing/helper';


jest.setTimeout(30 * 60 * 1000);

const { mockServer, wns: { chainId, endpoint, privateKey, fee } } = getConfig();

const auctionTests = (numBidders = 3) => {
  let registry;

  const accounts = [];

  let auctionId;
  let authorityName;

  beforeAll(async () => {
    console.log('Running auction tests with num bidders', numBidders);

    registry = new Registry(endpoint, chainId);
  });

  test('Setup bidder accounts', async () => {
    for (let i = 0; i < numBidders; i++) {
      const mnenonic = Account.generateMnemonic();
      const account = Account.generateFromMnemonic(mnenonic);
      const bidderAddress = account.formattedCosmosAddress;
      // eslint-disable-next-line no-await-in-loop
      await registry.sendCoins([{ denom: 'uwire', amount: '1000000000' }], bidderAddress, privateKey, fee);
      accounts.push({ address: bidderAddress, privateKey: account.privateKey.toString('hex') });
    }
  });

  test('Reserve authority.', async () => {
    authorityName = `dxos-${Date.now()}`;
    await registry.reserveAuthority(authorityName, accounts[0].privateKey, fee);
  });

  test('Authority should be under auction.', async () => {
    const result = await registry.lookupAuthorities([authorityName], true);
    expect(result).toBeDefined();
    expect(result.records).toBeDefined();

    const [record] = result.records;
    expect(record.ownerAddress).toEqual('');
    expect(record.height).toBeDefined();
    expect(record.status).toEqual('auction');

    expect(record.auction.id).toBeDefined();
    expect(record.auction.status).toEqual('commit');

    auctionId = record.auction.id;
  });

  test('Commit bids.', async () => {
    for (let i = 0; i < numBidders; i++) {
      // eslint-disable-next-line no-await-in-loop
      accounts[i].bid = await createBid(chainId, auctionId, accounts[i].address, `${10000000 + (i * 500)}uwire`);
      // eslint-disable-next-line no-await-in-loop
      await registry.commitBid(auctionId, accounts[i].bid.commitHash, accounts[i].privateKey, fee);
    }
  });

  test('Check bids are committed', async () => {
    const result = await registry.lookupAuthorities([authorityName], true);
    expect(result).toBeDefined();
    expect(result.records).toBeDefined();

    const [record] = result.records;
    expect(record.auction.id).toBeDefined();
    expect(record.auction.status).toEqual('commit');
    expect(record.auction.bids).toHaveLength(accounts.length);
    record.auction.bids.forEach(bid => {
      expect(bid.status).toEqual('commit');
    });
  });

  test('Wait for reveal phase.', async (done) => {
    setTimeout(done, 60 * 1000);
  });

  test('Reveal bids.', async () => {
    const [auction] = await registry.getAuctionsByIds([auctionId]);
    expect(auction.status).toEqual('reveal');

    for (let i = 0; i < numBidders; i++) {
      // eslint-disable-next-line no-await-in-loop
      await registry.revealBid(auctionId, accounts[i].bid.revealString, accounts[i].privateKey, fee);
    }
  });

  test('Check bids are revealed', async () => {
    const [auction] = await registry.getAuctionsByIds([auctionId]);
    expect(auction.status).toEqual('reveal');
    auction.bids.forEach(bid => {
      expect(bid.status).toEqual('reveal');
    });
  });

  test('Wait for auction completion.', async (done) => {
    setTimeout(done, 60 * 1000);
  });

  test('Check auction winner, authority owner and status.', async () => {
    const [auction] = await registry.getAuctionsByIds([auctionId]);
    expect(auction.status).toEqual('completed');

    const highestBidder = accounts[accounts.length - 1];
    const secondHighestBidder = (accounts.length > 1 ? accounts[accounts.length - 2] : highestBidder);

    expect(auction.winnerAddress).toEqual(highestBidder.address);
    expect(highestBidder.bid.reveal.bidAmount).toEqual(`${auction.winnerBid.quantity}${auction.winnerBid.type}`);
    expect(secondHighestBidder.bid.reveal.bidAmount).toEqual(`${auction.winnerPrice.quantity}${auction.winnerPrice.type}`);

    const result = await registry.lookupAuthorities([authorityName], true);
    expect(result).toBeDefined();
    expect(result.records).toBeDefined();

    const [record] = result.records;
    expect(record.ownerAddress).toEqual(highestBidder.address);
    expect(record.height).toBeDefined();
    expect(record.status).toEqual('active');
  });
};

const withNumBidders = (numBidders) => () => auctionTests(numBidders);

if (mockServer || !process.env.WIRE_AUCTIONS_ENABLED) {
  // Required as jest complains if file has no tests.
  test('skipping auction tests', () => {});
} else {
  /**
    Running these tests requires name auctions enabled and timers set as below:

    make install
    ./scripts/setup.sh --reset
    wire wns migrate patch --to-file ~/.wire/dxnsd/config/genesis.json --key 'app_state.nameservice.params.authority_auction_enabled' --value true --type bool
    wire wns migrate patch --to-file ~/.wire/dxnsd/config/genesis.json --key 'app_state.nameservice.params.authority_rent_duration' --value '60000000000'
    wire wns migrate patch --to-file ~/.wire/dxnsd/config/genesis.json --key 'app_state.nameservice.params.authority_grace_period' --value '300000000000'
    wire wns migrate patch --to-file ~/.wire/dxnsd/config/genesis.json --key 'app_state.nameservice.params.authority_auction_commits_duration' --value '60000000000'
    wire wns migrate patch --to-file ~/.wire/dxnsd/config/genesis.json --key 'app_state.nameservice.params.authority_auction_reveals_duration' --value '60000000000'
    ./scripts/server.sh start --tail

    WIRE_AUCTIONS_ENABLED=1 yarn jest --runInBand --no-cache src/auction.test.js
  */
  describe('Auction (1 bidder)', withNumBidders(1));
  describe('Auction (2 bidders)', withNumBidders(2));
  describe('Auction (4 bidders)', withNumBidders(4));
}
