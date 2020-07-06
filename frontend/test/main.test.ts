import { test } from '@bigtest/suite';
import { App, P } from './interactors';

export default test('Release Manager')
  .step("load", async () => {
    await App.visit();
  })
  .assertion("has content", async () => {
    await P("Hello world").exists();
  });
