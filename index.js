const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const awsx = require('@pulumi/awsx');
const cloud = require("@pulumi/cloud-aws");

const role = new aws.iam.Role("roles-lambda", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'lambda.amazonaws.com' }),
});

const policy = new aws.iam.RolePolicy("policies-lambda", {
  role,
  policy: pulumi.output({
    Version: '2012-10-17',
    Statement: [{
      Action: ['logs:*', 'cloudwatch:*', 's3:*'],
      Resource: '*',
      Effect: 'Allow',
    }],
  }),
});

const lambda = new aws.lambda.Function('lambda-api', {
  runtime: aws.lambda.NodeJS10dXRuntime,
  code: new pulumi.asset.AssetArchive({
    '.': new pulumi.asset.FileArchive('./api-build'),
  }),
  timeout: 300,
  handler: 'index.handler',
  role: role.arn,
});

const api = new awsx.apigateway.API('pulumi', {
  stageName: 'dev',
  routes: [
    {
      path: '/graphql',
      method: 'POST',
      eventHandler: lambda,
    },
    {
      path: '/graphql',
      method: 'GET',
      eventHandler: lambda,
    },
  ],
});

exports.url = api.url;

