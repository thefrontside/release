import { Operation, resource } from 'effection';
import { Channel } from '@effection/channel';
import { Server } from 'http';
import { AddressInfo } from 'net';

import { createAPI, WebhookEvent } from './api';

export interface OrchestratorOptions {
  githubWebhookSecret: string;
  port?: number;
}

export function* createOrchestrator(options: OrchestratorOptions): Operation<Orchestrator> {
  let webhooks = new Channel<WebhookEvent>();

  let server = createAPI({...options, webhooks });

  let ready: () => void;
  let untilReady =  new Promise(resolve => ready = resolve);

  let orchestrator: Partial<Orchestrator> = {
    webhooks,
    get address() { return this.http?.address() as AddressInfo; },
    get localURL() { return `http://localhost:${this.address?.port}`; }
  };

  yield resource(orchestrator, function*() {
    try {
      orchestrator.http = yield server.listen(options.port);
      ready();
      yield;
    } finally {
      webhooks.close();
    }
  });

  yield untilReady;

  return orchestrator as Orchestrator;
}

export interface Orchestrator {
  http: Server;
  webhooks: Channel<WebhookEvent>;
  address: AddressInfo;
  localURL: string;
}
