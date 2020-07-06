import { describe, it } from 'mocha';
import * as expect from 'expect';
import { ExecutionResult } from 'graphql';

import { createTestServer } from './helpers';
import { TestServer } from './helpers/test-server';

describe('graphql', () => {
  let server: TestServer;

  beforeEach(async () => {
    server = await createTestServer();
  });

  describe('query over http', () => {
    let result: ExecutionResult;
    beforeEach(async () => {
      result = await server.query(`{ echo(message: "Hello World") }`);
    });

    it('successfully executes the query', () => {
      expect(result).toEqual({ data: { echo: "Hello World"} });
    });
  });
});
