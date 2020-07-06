import { main, Context, Operation  } from 'effection';
import { Channel } from '@effection/channel';
import { Subscription } from '@effection/subscription';

let evalLoop: Context;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Run<T = any> {
  operation: Operation<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

const operations = new Channel<Run>();

export function perform<T>(operation: Operation<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => operations.send({
    operation,
    resolve,
    reject
  }));
}

beforeEach(() => {
  evalLoop = main(function*() {
    let subscription: Subscription<Run, void> = yield operations.subscribe();
    while (true) {
      let next: IteratorResult<Run> = yield subscription.next();
      if (!next.done) {
        let run = next.value;
        try {
          let result = yield run.operation;
          run.resolve(result);
        } catch (error) {
          run.reject(error);
        }
      }
    }
  });
});

afterEach(() => {
  evalLoop.halt()
});
