import * as express from 'express';
import { Operation, resource, spawn } from 'effection';
import { Channel } from '@effection/channel';
import { once } from '@effection/events';
import { Server } from 'http';

export function espresso(): Espresso {
  return new Espresso();
}

export class Espresso {
  constructor(private routes: Route[] = []) {}

  post(path: string, handler: RequestHandler): Espresso {
    return this.addRoute('post', path, handler);
  }

  get(path: string, handler: RequestHandler): Espresso {
    return this.addRoute('get', path, handler);
  }

  use(path: string, handler: RequestHandler): Espresso {
    return this.addRoute('use', path, handler);
  }

  *listen(port: number | undefined = undefined): Operation<Server> {
    let app = express();
    let handlers: Operation<void>[] = [];
    for (let route of this.routes) {
      let channel = new Channel<[express.Request, express.Response, express.NextFunction], void>();
      handlers.push(route.handler(channel))
      app[route.method](route.path, (request, response, next) => {
        channel.send([request, response, next]);
      });
    }
    let http = app.listen(port);


    yield resource(http, function*() {
      try {
        for (let handler of handlers) {
          yield spawn(handler);
        }
        yield;
      } finally {
        http.close();
      }
    });

    yield once(http, 'listening');

    return http;
  }

  private addRoute(method: RouteMatchType, path: string, handler: RequestHandler) {
    return new Espresso([...this.routes, { method, path, handler }]);
  }
}

export interface Route {
  method: RouteMatchType;
  path: string;
  handler: RequestHandler;
}

export interface RequestHandler {
  (channel: Channel<Intercept, void>): Operation<void>;
}

export type Intercept = [express.Request, express.Response, express.NextFunction];

export type RouteMatchType = 'get' | 'post' | 'use';
