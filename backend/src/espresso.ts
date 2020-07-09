import * as express from 'express';
import { Operation, resource, spawn } from 'effection';
import { Channel } from '@effection/channel';
import { once } from '@effection/events';
import { Server } from 'http';

export function espresso(): Espresso {
  return new Espresso();
}

export class Espresso {
  constructor(private routes: Route[] = [], private middlewares: Handler[] = []) {}
  
  post(path: string, handler: RouteHandler): Espresso {
    return this.addRoute('post', path, handler);
  }

  get(path: string, handler: RouteHandler): Espresso {
    return this.addRoute('get', path, handler);
  }

  use(path: string, handler: RouteHandler): Espresso {
    return this.addRoute('use', path, handler);
  }

  static(path: string, root: string): Espresso {
    return this.addMiddleware(path, express.static(root));
  }

  *listen(port: number | undefined = undefined): Operation<Server> {
    let app = express();

    for (let middleware of this.middlewares) {
      app.use(middleware.path, middleware.handler);
    }

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

  private addRoute(method: RouteMatchType, path: string, handler: RouteHandler) {
    return new Espresso([...this.routes, { method, path, handler }], this.middlewares);
  }

  private addMiddleware(path: string, handler: express.Handler) {
    return new Espresso(this.routes, [...this.middlewares, { path, handler }]);
  }
}

export interface Route {
  method: RouteMatchType;
  path: string;
  handler: RouteHandler;
}

export interface Handler {
  path: string;
  handler: express.Handler;
}

export interface RouteHandler {
  (channel: Channel<Intercept, void>): Operation<void>;
}

export type Intercept = [express.Request, express.Response, express.NextFunction];

export type RouteMatchType = 'get' | 'post' | 'use';
