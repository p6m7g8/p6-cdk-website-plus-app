import { awscdk } from "projen";
const project = new awscdk.AwsCdkTypeScriptApp({
  name: "p6-cdk-website-plus",

  authorEmail: "pgollucci@p6m7g8.com",
  authorName: "Philip M. Gollucci",
  authorUrl: "https://www.linkedin.com/in/pgollucci",
  authorOrganization: true,

  repository: "https://github.com/p6m7g8/p6-cdk-website-plus.git",
  stability: "experimental",

  description: "APIGW Receiver Serverless Image Brander for LDAR Pets",
  keywords: ["aws", "cdk", "website", "cloudfront", "s3"],

  cdkVersion: "2.83.0",
  defaultReleaseBranch: "main",
  projenrcTs: true,
  releaseFailureIssue: true,
  prettier: true,
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ["p6m7g8-automation"],
  },
});

project.synth();
