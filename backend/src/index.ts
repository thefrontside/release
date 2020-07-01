import { spawn } from 'effection';
import { main } from "@effection/node";
import { forEach } from "@effection/subscription";
import { env } from './env';

import { Orchestrator, createOrchestrator } from './orchestrator';

main(function*() {
  let server: Orchestrator = yield createOrchestrator(env);
  console.log(`--> server listening on port ${server.address.port}`);
  console.log(`  * graphql: http://localhost:${server.address.port}/graphql`);
  console.log(`  * webhook: http://localhost:${server.address.port}/github-webhooks`);

  yield spawn(forEach(server.webhooks, function*(event) {
    let { id, name, } = event;
    console.log(`received webhook ${name}:${id}`);
  }));

  yield;
});
