const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const awsx = require('@pulumi/awsx');
const readdirp = require('recursive-readdir-sync');
const mime = require('mime');
const path = require('path');

const role = new aws.iam.Role('roles-lambda', {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'lambda.amazonaws.com' }),
});

const apiPolicy = new aws.iam.RolePolicy('policies-api', {
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

const lambda = new aws.lambda.Function('pulumi-api', {
  runtime: aws.lambda.NodeJS10dXRuntime,
  code: new pulumi.asset.AssetArchive({
    '.': new pulumi.asset.FileArchive('../api'),
  }),
  timeout: 300,
  handler: 'index.handler',
  role: role.arn,
});

const api = new awsx.apigateway.API('pulumi-api', {
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

exports.apiUrl = api.url;

const web = new aws.s3.Bucket('pulumi-web', {
  website: {
    indexDocument: 'index.html',
  },
});

const webPolicy = new aws.s3.BucketPolicy('policies-web', {
  bucket: web.bucket, // refer to the bucket created earlier
  policy: web.bucket.apply(bucketName => {
    return {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: '*',
        Action: [
          's3:GetObject',
        ],
        Resource: [
          `arn:aws:s3:::${bucketName}/*`,
        ],
      }],
    };
  }),
});

for (const dir of readdirp('../web/build')) {
  const object = new aws.s3.BucketObject(dir, { 
    bucket: web,
    source: new pulumi.asset.FileAsset(dir),
    key: dir.replace('../web/build/', ''),
    contentType: mime.getType(dir) || undefined,
  });
}

exports.webBucket = web.bucket;
exports.webUrl = web.websiteEndpoint;

