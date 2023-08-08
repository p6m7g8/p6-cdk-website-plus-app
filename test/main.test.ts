import { Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { MyStack } from "../src/main";

test("Stack creates expected resources", () => {
  const app = new Stack();

  // WHEN
  // the AwsEnvironment
  const theEnv = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  };
  const stack = new MyStack(app, "TestStack", {
    env: theEnv,
    verifyEmail: "test@example.com",
    domainName: "example.com",
  });

  const template = Template.fromStack(stack);

  // THEN
  // Check for S3 Bucket
  template.resourceCountIs("AWS::S3::Bucket", 2);

  // Check for CloudFront Distribution
  template.resourceCountIs("AWS::CloudFront::Distribution", 2);

  // Check for Route 53 A Record
  template.resourceCountIs("AWS::Route53::RecordSet", 4); // 1 A Record + 1 AAAA Record

  // Check for ACM Certificate
  template.resourceCountIs("AWS::CertificateManager::Certificate", 1);

  // Ensure the bucket blocks all public access
  template.hasResourceProperties("AWS::S3::Bucket", {
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  });
});
