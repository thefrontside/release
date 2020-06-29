import { resource, Operation } from 'effection';
import { fetch } from '@effection/fetch';
import { v4 as uuidv4 } from 'uuid';

import { createWebhookServer, WebhookServer } from '../../src/webhook-server';

import { perform } from './perform';

export async function createTestServer(): Promise<TestServer> {
  let webhookServer: WebhookServer;
  let signalReady: () => void;
  let ready = new Promise((resolve) => signalReady = resolve);

  async function deliver(eventType: GithubEventType, payload: unknown): Promise<string> {
    return await perform(function*(): Operation<string> {
      let body: string = JSON.stringify(payload);

      let response: Response = yield fetch(webhookServer.localURL, {
        body,
        method: 'POST',
        headers: {
          'x-github-event': eventType,
          'x-github-delivery': uuidv4(),
          'x-hub-signature': webhookServer.webhooks.sign(body)
        },
      });
      if (!response.ok) {
        let error = new Error(`${response.status} ${response.statusText}`);
        error.name = 'DeliveryError';
      }
      return yield response.text().then(text => text.trim());
    });
  }

  return await perform(function*() {
    let testServer =  yield resource({ deliver }, function*() {
      webhookServer = yield createWebhookServer({
        secret: 'fake-secret'
      });
      signalReady();
      yield;
    });

    yield ready;

    return testServer;
  })

}

export interface TestServer {
  deliver(eventType: GithubEventType, payload: unknown): Promise<string>;
}

export type GithubEventType = 'ping' | 'push';
