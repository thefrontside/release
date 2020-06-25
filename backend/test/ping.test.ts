import { v4 as uuidv4 } from 'uuid';
import { describe, it } from 'mocha';
import { perform } from './helpers';
import * as expect from 'expect';
import { Webhooks } from '@octokit/webhooks';

import { fetch } from '@effection/fetch';

import { createWebhookServer, WebhookServer } from '../src/webhook-server';

describe('ping', () => {
  let server: WebhookServer;
  let signer: Webhooks

  beforeEach(async () => {
    signer = new Webhooks({ secret: 'TOP_SECRET' });
    server = await perform(createWebhookServer({ secret: 'TOP_SECRET'}));
  });

  describe('with bad credentials', () => {
    let response: Response;

    beforeEach(async () => {
      response = await perform(fetch(server.localURL, {
        method: 'POST',
        body: JSON.stringify({
          "zen": 'do not dive after keys dropped into lava',
          "hook_id": 1
        })
      }));

    });

    it('is not ok', () => {
      expect(response.ok).toEqual(false);
    });
  });

  describe('with a signed request', () => {
    let response: Response;
    let text: string;
    beforeEach(async () => {
      let body = JSON.stringify({
          "zen": 'do not dive after keys dropped into lava',
          "hook_id": 1
      });
      response = await perform(fetch(server.localURL, {
        method: 'POST',
        headers: {
          'x-github-event': 'ping',
          'x-github-delivery': uuidv4(),
          'x-hub-signature': signer.sign(body)
        },
        body
      }))
      text = await response.text();
    });

    it('is ok', () => {
      expect(response.ok).toEqual(true);
      expect(text.trim()).toEqual('ok');
    });

  });

})
