import { Channel } from '@effection/channel';
import { forEach } from '@effection/subscription';
import { schema } from './schema';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { Operation } from 'effection';
import { Intercept } from './espresso';

export function createGraphqQLHandler() {
  let middleware = graphqlHTTP({
    schema: buildSchema(schema),
    rootValue: {
      echo: ({ message }: { message: string}) => message
    },
    graphiql: true
  });

  return (channel: Channel<Intercept, void>) => forEach(channel, function*([request, response]) {
    middleware(request, response);
  }) as Operation<void>;
}
