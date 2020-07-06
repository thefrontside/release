import { Channel } from '@effection/channel';
import { distDir } from '@frontside/release.frontend';

import { espresso } from './espresso';
import { createWebhookHandler, WebhookEvent } from './github-webhooks';
import { createGraphqQLHandler } from './graphql';

export interface APIOptions {
  githubWebhookSecret: string;
  webhooks: Channel<WebhookEvent>;
}
export function createAPI(options: APIOptions)  {
  return espresso()
    .use('/github-webhook', createWebhookHandler(options.githubWebhookSecret, options.webhooks))
    .use('/graphql', createGraphqQLHandler())
    .static('/', distDir);
}

export { WebhookEvent } from './github-webhooks';
