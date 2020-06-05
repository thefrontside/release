import { Operation } from 'effection';
import * as express from 'express';

import { throwOnErrorEvent, once } from '@effection/events';

export class ExpressServer {
  app = express();

  *listen(port: number): Operation<void> {
    let http = this.app.listen(port);

    yield throwOnErrorEvent(http);

    try {
      yield once(http, 'listening');
      console.log('--> server listening on port', port);
      yield;
    } finally {
      http.close();
    }
  }
}
