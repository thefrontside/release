import { spawn } from 'effection';
import { main } from "@effection/node";
import { forEach } from "@effection/subscription";
import { env } from './env';

import { Orchestrator, createOrchestrator } from './orchestrator';

main(function*() {
  let server: Orchestrator = yield createOrchestrator(env);
  console.log(`--> listening on port ${server.address.port}`);

  yield spawn(forEach(server.webhooks, function*(event) {
    let { id, name, } = event;
    console.log(`received webhook ${name}:${id}`);
  }));

  yield;
});
