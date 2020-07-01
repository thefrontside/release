import { Operation } from 'effection';
import { Channel } from '@effection/channel';
import { forEach } from '@effection/subscription';
import { Webhooks } from '@octokit/webhooks';

import { RequestHandler, Intercept } from './espresso';

export type WebhookEvent<T = unknown> = Webhooks.WebhookEvent<T>;

export function createWebhookHandler(secret: string, events: Channel<WebhookEvent>): RequestHandler {

  let webhooks = new Webhooks({ secret });

  webhooks.on('*', event => events.send(event));

  return (requests: Channel<Intercept, void>) => forEach(requests, function*([request, response, next]) {
    webhooks.middleware(request, response, next);
  }) as Operation<void>;
}
