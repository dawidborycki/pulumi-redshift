import * as aws from "@pulumi/aws";

// VPC
const vpc = new aws.ec2.Vpc("pulumi-vpc", {
    cidrBlock: "10.1.0.0/16",
    tags: {
        Name: "pulumi-vpc"
    }
});

// Internet gateway
const internetGateway = new aws.ec2.InternetGateway("internet-gateway", {
    vpcId: vpc.id,
    tags: {
        Name: "pulumi-internet-gateway",
    },
});

// Subnet
const subnet = new aws.ec2.Subnet("pulumi-subnet", {
    cidrBlock: "10.1.1.0/24",
    availabilityZone: "us-east-1a",
    vpcId: vpc.id,
    tags: {
        Name: "pulumi-subnet",
    },
});

// Subnet group
const subnetGroup = new aws.redshift.SubnetGroup("pulumi-subnet-group", {
    subnetIds: [
        subnet.id,
    ],
    tags: {
        Name: "pulumi-subnet-group",
    },
});

// S3 bucket
const bucket = new aws.s3.Bucket("pulumi-s3-bucket");

const iamRole = new aws.iam.Role("pulumi-iam-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Sid: "",
            Principal: {
                Service: "redshift.amazonaws.com",
            },
        }],
    }),
    inlinePolicies: [{
        name: "pulumi-policy",
        policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Action: ["s3:Get*", "s3:List*"],
                Effect: "Allow",
                Resource: "*",
            }],
        }),
    }]
});

// Redshift cluter
const redshiftCluster = new aws.redshift.Cluster("pulumi-redshift-cluster", {
    clusterIdentifier: "pulumi-redshift-cluster",
    clusterType: "single-node",
    databaseName: "tempdb",
    masterPassword: "Passw0rD",
    masterUsername: "admin",
    nodeType: "dc2.large",
    clusterSubnetGroupName: subnetGroup.name,
    skipFinalSnapshot: true,
    iamRoles: [iamRole.arn]
});
