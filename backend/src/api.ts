import { Channel } from '@effection/channel';

import { espresso, Espresso } from './espresso';
import { createWebhookHandler, WebhookEvent } from './github-webhooks';
import { createGraphqQLHandler } from './graphql';

export interface APIOptions {
  githubWebhookSecret: string;
  webhooks: Channel<WebhookEvent>;
}
export function createAPI(options: APIOptions): Espresso  {
  return espresso()
    .use('/github-webhook', createWebhookHandler(options.githubWebhookSecret, options.webhooks))
    .use('/graphql', createGraphqQLHandler());
}

export { WebhookEvent } from './github-webhooks';
