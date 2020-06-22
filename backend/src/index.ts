import { main } from "@effection/node";

import { getPort } from './get-port';
import { ExpressServer } from './server';

main(function*() {
  let server: ExpressServer = new ExpressServer();
  yield server.listen(getPort());
});
