import { describe, it } from 'mocha';
import * as expect from 'expect';

import { createTestServer, TestServer } from './helpers';

describe('ui', () => {
  let server: TestServer;
  let index: Response;
  beforeEach(async () => {
    server = await createTestServer();

    index = await server.get('/');
  });

  it('loads at root url', () => {
    expect(index.ok).toEqual(true);
    expect(index.status).toEqual(200);
  });
});
