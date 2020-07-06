import { ExecutionResult } from 'graphql';

import { resource, Operation } from 'effection';
import { fetch } from '@effection/fetch';
import { v4 as uuidv4 } from 'uuid';

import { Webhooks } from '@octokit/webhooks';

import { createOrchestrator, Orchestrator } from '../../src/orchestrator';

import { perform } from './perform';

export async function createTestServer(): Promise<TestServer> {
  let githubWebhookSecret = 'fake-secret';
  let orchestrator: Orchestrator;
  let signalReady: () => void;
  let ready = new Promise((resolve) => signalReady = resolve);

  async function deliverWebhook(eventType: GithubEventType, payload: unknown): Promise<string> {
    return await perform(function*(): Operation<string> {
      let body: string = JSON.stringify(payload);

      let webhookURL = `${orchestrator.localURL}/github-webhook`;

      let response: Response = yield fetch(webhookURL, {
        body,
        method: 'POST',
        headers: {
          'x-github-event': eventType,
          'x-github-delivery': uuidv4(),
          'x-hub-signature': sign(body, githubWebhookSecret)
        },
      });

      let responseBody;

      try {
        responseBody = yield response.text().then(text => text.trim());
      } catch (_error) { /* don't care if we can't get text */ }

      if (!response.ok) {
        let error = new Error(`${response.status} ${response.statusText} ${responseBody}`);
        error.name = 'DeliveryError';
        throw error;
      }
      return responseBody;
    });
  }

  async function query(source: string) {
    return perform(function*(): Operation<ExecutionResult> {
      let response: Response = yield fetch(`${orchestrator.localURL}/graphql`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql'
        },
        body: source
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      let result = yield response.json();
      return result as ExecutionResult;
    });
  }

  async function get(path: string) {
    return perform(fetch(`${orchestrator.localURL}${path}`, {
      method: 'GET'
    }));
  }

  return await perform(function*() {
    let testServer =  yield resource({ deliverWebhook, query, get }, function*() {
      orchestrator = yield createOrchestrator({
        githubWebhookSecret
      });
      signalReady();
      yield;
    });

    yield ready;

    return testServer;
  })

}

export interface TestServer {
  deliverWebhook(eventType: GithubEventType, payload: unknown): Promise<string>;
  query(source: string): Promise<ExecutionResult>;
  get(path: string): Promise<Response>;
}

export type GithubEventType = 'ping' | 'push';


function sign(data: string, secret: string) {
  return new Webhooks({ secret }).sign(data);
}
