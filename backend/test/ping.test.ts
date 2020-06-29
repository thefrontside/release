import { describe, it } from 'mocha';
import * as expect from 'expect';

import { TestServer, createTestServer } from './helpers/test-server';

describe('ping', () => {
  let server: TestServer;

  beforeEach(async () => {
    server = await createTestServer();
  });

  describe('with a signed request', () => {
    let response: string;

    beforeEach(async () => {
      response = await server.deliver('ping', {
        "zen": 'do not dive after keys dropped into lava',
        "hook_id": 1
      });
    });

    it('is ok', () => {
      expect(response).toEqual('ok');
    });

  });

})
