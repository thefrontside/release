import { createInteractor } from '@bigtest/interactor';
export { App } from '@bigtest/interactor';

export const P = createInteractor("paragraph")({
  selector: 'p'
});
