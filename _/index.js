const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const awsx = require('@pulumi/awsx');
const readdirp = require('recursive-readdir-sync');
const mime = require('mime');
const path = require('path');



// Apollo Serverless

// const role = new aws.iam.Role('roles-lambda', {
//   assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'lambda.amazonaws.com' }),
// });
// 
// const apiPolicy = new aws.iam.RolePolicy('policies-api', {
//   role,
//   policy: pulumi.output({
//     Version: '2012-10-17',
//     Statement: [{
//       Action: ['logs:*', 'cloudwatch:*', 's3:*'],
//       Resource: '*',
//       Effect: 'Allow',
//     }],
//   }),
// });
// 
// const lambda = new aws.lambda.Function('pulumi-api', {
//   runtime: aws.lambda.NodeJS10dXRuntime,
//   code: new pulumi.asset.AssetArchive({
//     '.': new pulumi.asset.FileArchive('../api'),
//   }),
//   timeout: 300,
//   handler: 'index-lambda.handler',
//   role: role.arn,
// });
// 
// const api = new awsx.apigateway.API('pulumi-api', {
//   stageName: 'dev',
//   routes: [
//     {
//       path: '/graphql',
//       method: 'POST',
//       eventHandler: lambda,
//     },
//     {
//       path: '/graphql',
//       method: 'GET',
//       eventHandler: lambda,
//     },
//   ],
// });
// 
// exports.apiUrl = api.url;




// CRA S3

// const web = new aws.s3.Bucket('pulumi-web', {
//   website: {
//     indexDocument: 'index.html',
//   },
// });
// 
// const webPolicy = new aws.s3.BucketPolicy('policies-web', {
//   bucket: web.bucket, // refer to the bucket created earlier
//   policy: web.bucket.apply(bucketName => {
//     return {
//       Version: '2012-10-17',
//       Statement: [{
//         Effect: 'Allow',
//         Principal: '*',
//         Action: [
//           's3:GetObject',
//         ],
//         Resource: [
//           `arn:aws:s3:::${bucketName}/*`,
//         ],
//       }],
//     };
//   }),
// });
// 
// for (const dir of readdirp('../web/build')) {
//   const object = new aws.s3.BucketObject(dir, { 
//     bucket: web,
//     source: new pulumi.asset.FileAsset(dir),
//     key: dir.replace('../web/build/', ''),
//     contentType: mime.getType(dir) || undefined,
//   });
// }
// 
// exports.webBucket = web.bucket;
// exports.webUrl = web.websiteEndpoint;



// Apollo Fargate

// const vpc = new awsx.ec2.Vpc('api2-vpc');
// 
// const api2Cluster = new awsx.ecs.Cluster('api2-cluster', { vpc });
// 
// const api2LoadBalancer = new awsx.lb.ApplicationLoadBalancer('api2-lb', {
//   external: true,
//   securityGroups: api2Cluster.securityGroups,
//   vpc,
// });
// 
// const api2ContainerTarget = api2LoadBalancer.createTargetGroup('api2-target', {
//   protocol: 'HTTP',
//   port: 4000,
// });
// const api2WebListener = api2ContainerTarget.createListener('api2-listener', { port: 80 });
// 
// const api2Img = awsx.ecs.Image.fromPath('pulumi-api2', '../api');
// 
// const appService = new awsx.ecs.FargateService('api2-service', {
//   cluster: api2Cluster,
//   taskDefinitionArgs: {
//     containers: {
//       app: {
//         image: api2Img,
//         memory: 50,
//         portMappings: [api2WebListener],
//         environment: [
//           {
//             name: 'PORT',
//             value: '80',
//           },
//         ],
//       },
//     },
//   },
//   desiredCount: 1,
// });
// 
// exports.api2Url = api2WebListener.endpoint.hostname;




