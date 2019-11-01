const { ApolloServer, gql } = require('apollo-server-lambda');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: (root, args, context) => {
      return "Hello, world!";
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true
});

exports.handler = (event, ctx, cb) => {
  const handler = server.createHandler();

  if (event.isBase64Encoded) {
    event.body = Buffer.from(event.body, 'base64').toString();
  }

  return handler(event, ctx, cb);
};
