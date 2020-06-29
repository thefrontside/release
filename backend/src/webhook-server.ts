import { Operation, resource } from 'effection';
import { Channel } from '@effection/channel';
import { once } from '@effection/events';
import { Webhooks } from '@octokit/webhooks';
import { createServer } from 'http';
import { AddressInfo } from 'net';

export interface WebhookServerOptions {
  port?: number;
  secret: string;
}

export type WebhookEvent<T = unknown> = Webhooks.WebhookEvent<T>;

export function* createWebhookServer(options: WebhookServerOptions): Operation<WebhookServer> {
  let { port, secret } = options;

  let events = new Channel<Webhooks.WebhookEvent<unknown>>();

  let webhooks = new Webhooks({ secret });

  webhooks.on('*', event => events.send(event))

  let http = createServer(webhooks.middleware);

  http.listen(port);

  yield once(http, 'listening');

  let address = http.address() as AddressInfo;

  let localURL = `http://localhost:${address.port}`;

  return yield resource({ address, events, webhooks, localURL }, function*() {
    try {
      yield;
    } finally {
      http.close()
      events.close();
    }
  })
}

export interface WebhookServer {
  address: AddressInfo;
  events: Channel<WebhookEvent>;
  localURL: string;
  webhooks: Webhooks;
}
