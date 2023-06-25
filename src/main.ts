import * as cdk from "aws-cdk-lib";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Patterns from "aws-cdk-lib/aws-route53-patterns";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

/**
 *
 */
interface MyStackProps extends cdk.StackProps {
  // @default - no value
  verifyEmail: string;

  // @default - no value
  domainName: string;
}

/**
 *
 */
export class MyStack extends cdk.Stack {
  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);
    console.log(props);

    const recordName = "www." + props.domainName;

    const zone = route53.PublicHostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName,
    });

    const certificate = new certificatemanager.Certificate(
      this,
      "MyCertificate",
      {
        domainName: recordName,
        validation: certificatemanager.CertificateValidation.fromEmail({
          email: props.verifyEmail,
        }),
      }
    );

    const bucket = new s3.Bucket(this, "MyBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      websiteIndexDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const oai = new cloudfront.OriginAccessIdentity(this, "OAI");
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "Distribution",
      {
        comment: recordName,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oai,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
          certificate,
          {
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            aliases: [recordName],
          }
        ),
      }
    );

    new route53.ARecord(this, "CloudfrontDnsRecord", {
      zone: zone,
      recordName: recordName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
    });

    new route53.AaaaRecord(this, "CloudfrontDnsRecordAAAA", {
      zone: zone,
      recordName: recordName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
    });

    new route53Patterns.HttpsRedirect(this, "Redirect", {
      recordNames: [props.domainName],
      targetDomain: recordName,
      zone: zone,
    });
  }
}

// the AwsEnvironment
const theEnv = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
new MyStack(app, "p6-website-gollucci-com", {
  env: theEnv,
  verifyEmail: "pgollucci@p6m7g8.com",
  domainName: "gollucci.com",
});
new MyStack(app, "p6-website-p6m7g8-com", {
  env: theEnv,
  verifyEmail: "pgollucci@p6m7g8.com",
  domainName: "p6m7g8.com",
});
app.synth();
