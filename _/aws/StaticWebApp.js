const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const readdirp = require('recursive-readdir-sync');
const mime = require('mime');
const path = require('path');

module.exports = class StaticWebApp {
  constructor(name, props = {}) {
    const { buildDir } = props;

    const bucket = this.bucket = new aws.s3.Bucket(`${name}-web-s3`, {
      website: {
        indexDocument: 'index.html',
      },
    });

    const policy = this.policy = new aws.s3.BucketPolicy(`${name}-s3-policy`, {
      bucket: bucket.bucket, // refer to the bucket created earlier
      policy: bucket.bucket.apply(bucketName => {
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

    for (const dir of readdirp(buildDir)) {
      const object = new aws.s3.BucketObject(dir, { 
        bucket: bucket,
        source: new pulumi.asset.FileAsset(dir),
        key: dir.replace(buildDir, ''),
        contentType: mime.getType(dir) || undefined,
      });
    }
  }
}
