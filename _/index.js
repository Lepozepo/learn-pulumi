const pulumi = require('@pulumi/pulumi');
const awsx = require('@pulumi/awsx');

// const config = new pulumi.Config();
// const notsecret = config.require('notsecret');
// const secret = config.requireSecret('secret');

// AWS Apollo Serverless

// const ApolloServerless = require('./aws/ApolloServerless');
// const apollo = new ApolloServerless('apollo-lambda', {
//   code: new pulumi.asset.AssetArchive({
//     '.': new pulumi.asset.FileArchive('../api'),
//   }),
//   environment: {
//     variables: {
//       HELLO: 'WORLD',
//       notsecret,
//       secret,
//     },
//   },
// });
// exports.url = apollo.api.url;


// AWS CRA S3

// const StaticWebApp = require('./aws/StaticWebApp');
// const webapp = new StaticWebApp('web', {
//   buildDir: '../web/build/',
// });
// exports.webBucket = webapp.bucket.bucket;
// exports.webUrl = webapp.bucket.endpoint;


// AWS Apollo Fargate

// const ApolloFargate = require('./aws/ApolloFargate');
// const apollo2 = new ApolloFargate('fargate', {
//   image: awsx.ecs.Image.fromPath('fargate-img', '../api'),
//   environment: [
//     {
//       name: 'HELLO',
//       value: 'WORLD',
//     },
//   ],
// });
// exports.url = apollo2.webListener.endpoint.hostname;


// Apollo Any Cloud

// const cloud = require('@pulumi/cloud');
// const multicloud = new cloud.Service('multicloud', {
//   containers: {
//     api: {
//       build: '../api',
//       memory: 512,
//       ports: [{
//         port: 80,
//         targetPort: 4000,
//       }],
//       environment: {
//         PORT: '80',
//       },
//     },
//   },
// });
// exports.multicloudURL = multicloud.endpoints.api[80].hostname;


// More Relevant Lambdas

// const aws = require('@pulumi/aws');
// 
// const key = new aws.kms.Key('s3-key', {
//   deletionWindowInDays: 10,
//   description: 'This key is used to encrypt bucket objects',
// });
// 
// const bucket = new aws.s3.Bucket('s3-bucket', {
//   serverSideEncryptionConfiguration: {
//     rule: {
//       applyServerSideEncryptionByDefault: {
//         kmsMasterKeyId: key.arn,
//         sseAlgorithm: "aws:kms",
//       },
//     },
//   },
// });
// 
// bucket.onEvent('s3-lambda', (e) => {
//   console.log(e);
//   return;
// }, {
//   events: ['s3:ObjectCreated:*']
// });
// 
// exports.bucket = bucket.bucket

