const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const awsx = require('@pulumi/awsx');

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

const api = new aws.apigateway.RestApi('api', {});
const resource = new aws.apigateway.Resource('resource', {
  parentId: api.rootResourceId,
  pathPart: 'graphql',
  restApi: api.id,
});

const apiOptionsMethod = new aws.apigateway.Method('api-options', {
  authorization: 'NONE',
  httpMethod: 'OPTIONS',
  requestParameters: {},
  resourceId: resource.id,
  restApi: api.id,
});

const response200 = new aws.apigateway.MethodResponse('api-options-response200', {
  httpMethod: apiOptionsMethod.httpMethod,
  resourceId: resource.id,
  restApi: api.id,
  statusCode: '200',
  responseParameters: {
    'method.response.header.Access-Control-Allow-Origin': true,
    'method.response.header.Access-Control-Allow-Headers': true,
    'method.response.header.Access-Control-Allow-Methods': true,
    'method.response.header.Access-Control-Allow-Credentials': true,
  },
  responseModels: {},
});

const optionsIntegration = new aws.apigateway.Integration('api-options-integration', {
  httpMethod: apiOptionsMethod.httpMethod,
  type: 'MOCK',
  requestTemplates: {
    'application/json': '{statusCode:200}'
  },
  contentHandling: 'CONVERT_TO_TEXT',
  resourceId: resource.id,
  restApi: api.id,
});

const integrationResponse = new aws.apigateway.IntegrationResponse('api-options-integration-response', {
  httpMethod: apiOptionsMethod.httpMethod,
  statusCode: response200.statusCode,
  responseParameters: {
    'method.response.header.Access-Control-Allow-Origin': "'*'",
    'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
    'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,POST'",
    'method.response.header.Access-Control-Allow-Credentials': "'false'",
  },
  responseTemplates: {
    'application/json': "#set($origin = $input.params(\"Origin\"))\n#if($origin == \"\") #set($origin = $input.params(\"origin\")) #end\n#if($origin == \"*\") #set($context.responseOverride.header.Access-Control-Allow-Origin = $origin) #end",
  },
  resourceId: resource.id,
  restApi: api.id,
});

const apiGetMethod = new aws.apigateway.Method('api-get', {
  authorization: 'NONE',
  httpMethod: 'GET',
  resourceId: resource.id,
  restApi: api.id,
});

const getIntegration = new aws.apigateway.Integration('api-get-integration', {
  httpMethod: apiGetMethod.httpMethod,
  integrationHttpMethod: 'GET',
  resourceId: resource.id,
  restApi: api.id,
  type: 'AWS_PROXY',
  uri: lambda.invokeArn,
});

const apiPostMethod = new aws.apigateway.Method('api-post', {
  authorization: 'NONE',
  httpMethod: 'POST',
  resourceId: resource.id,
  restApi: api.id,
});

const postIntegration = new aws.apigateway.Integration('api-post-integration', {
  httpMethod: apiPostMethod.httpMethod,
  integrationHttpMethod: 'POST',
  resourceId: resource.id,
  restApi: api.id,
  type: 'AWS_PROXY',
  uri: lambda.invokeArn,
});

const deployment = new aws.apigateway.Deployment('api-deployment', {
  restApi: api,
  // Note: Set to empty to avoid creating an implicit stage, we'll create it explicitly below instead.
  stageName: '',
}, {
  dependsOn: [getIntegration, postIntegration, optionsIntegration],
});

const stageName = 'dev';
const stage = new aws.apigateway.Stage('api-stage', {
  restApi: api,
  deployment,
  stageName,
});

const invokePermission = new aws.lambda.Permission('api-lambda-permission', {
  action: 'lambda:invokeFunction',
  function: lambda,
  principal: 'apigateway.amazonaws.com',
  sourceArn: pulumi.interpolate`${stage.executionArn}*/*`,
});

exports.url = pulumi.interpolate`${deployment.invokeUrl}${stageName}`;

// const api = new awsx.apigateway.API('pulumi', {
//   stageName: 'dev',
//   routes: [
//     // {
//     //   path: '/graphql',
//     //   method: 'OPTIONS',
//     //   data: {
//     //     'x-amazon-apigateway-integration': {
//     //       type: 'mock',
//     //       requestTemplates: {
//     //         'application/json': '{statusCode:200}'
//     //       },
//     //       contentHandling: 'CONVERT_TO_TEXT',
//     //       responses: {
//     //         '200': {
//     //           statusCode: '200',
//     //           responseParameters: {
//     //             'method.response.header.Access-Control-Allow-Origin': "'*'",
//     //             'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
//     //             'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,POST'",
//     //             'method.response.header.Access-Control-Allow-Credentials': "'false'",
//     //           },
//     //           responseTemplates: {
//     //             'application/json': "#set($origin = $input.params(\"Origin\"))\n#if($origin == \"\") #set($origin = $input.params(\"origin\")) #end\n#if($origin == \"*\") #set($context.responseOverride.header.Access-Control-Allow-Origin = $origin) #end"
//     //           },
//     //         },
//     //       },
//     //     },
//     //   },
//     // },
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

// exports.url = api.url;
