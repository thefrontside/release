import { spawn } from 'effection';
import { main } from "@effection/node";
import { forEach } from "@effection/subscription";
import { env } from './env';

import { createWebhookServer, WebhookServer } from './webhook-server';

main(function*() {
  let server: WebhookServer = yield createWebhookServer(env);
  console.log(`--> webhook server listening on port ${server.address.port}`);

  yield spawn(forEach(server.events, function*(event) {
    let { id, name, } = event;
    console.log(`received webhook ${name}:${id}`);
  }));

  yield;
});
