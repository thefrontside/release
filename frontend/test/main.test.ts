import { test } from '@bigtest/suite';
import { P } from './interactors';

export default test('Release Manager')
  .assertion("loads", async () => {
    await P("Hello world").exists();
  });
