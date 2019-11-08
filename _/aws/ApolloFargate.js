const pulumi = require('@pulumi/pulumi');
const awsx = require('@pulumi/awsx');

// Apollo Fargate

module.exports = class ApolloFargate {
  constructor(name, props = {}) {
    const { image, environment } = props;

    const vpc = this.vpc = props.vpc || new awsx.ec2.Vpc(`${name}-vpc`);

    const cluster = this.cluster = new awsx.ecs.Cluster(`${name}-cluster`, { vpc });

    const loadBalancer = this.loadBalancer = props.loadBalancer = new awsx.lb.ApplicationLoadBalancer(`${name}-lb`, {
      external: true,
      securityGroups: cluster.securityGroups,
      vpc,
    });

    const containerTarget = this.containerTarget = loadBalancer.createTargetGroup(`${name}-target`, {
      protocol: 'HTTP',
      port: 4000,
    });
    const webListener = this.webListener = containerTarget.createListener(`${name}-listener`, { port: 80 });

    const service = this.service = new awsx.ecs.FargateService(`${name}-service`, {
      cluster,
      taskDefinitionArgs: {
        containers: {
          app: {
            image,
            memory: 50,
            portMappings: [webListener],
            environment,
          },
        },
      },
      desiredCount: 1,
    });
  }
}

