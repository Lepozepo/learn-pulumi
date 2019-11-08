const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const awsx = require('@pulumi/awsx');

// Apollo Serverless

module.exports = class ApolloServerless {
  constructor(name, props = {}) {
    const {
      code,
      path = '/graphql',
      environment,
      stageName = pulumi.getStack(),
    } = props;

    const role = this.role = new aws.iam.Role(`${name}-role`, {
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'lambda.amazonaws.com' }),
    });

    const policy = this.policy = new aws.iam.RolePolicy(`${name}-policy`, {
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

    const lambda = this.lambda = new aws.lambda.Function(`${name}-lambda`, {
      runtime: aws.lambda.NodeJS10dXRuntime,
      code,
      timeout: 300,
      handler: 'index-lambda.handler',
      role: role.arn,
      environment,
    });

    const api = this.api = new awsx.apigateway.API(`${name}-api`, {
      stageName,
      routes: [
        {
          path,
          method: 'POST',
          eventHandler: lambda,
        },
        {
          path,
          method: 'GET',
          eventHandler: lambda,
        },
      ],
    });

    return {
      api,
      role,
      policy,
      lambda,
    }
  }
}



