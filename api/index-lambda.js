const { ApolloServer, gql } = require('apollo-server-lambda');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

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
