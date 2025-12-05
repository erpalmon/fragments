#!/bin/sh

# Setup steps for working with LocalStack and DynamoDB local instead of AWS.
# Assumes aws cli is installed and LocalStack and DynamoDB local are running.

# Setup AWS environment variables
echo "Setting AWS environment variables for LocalStack"

echo "AWS_ACCESS_KEY_ID=test"
export AWS_ACCESS_KEY_ID=test

echo "AWS_SECRET_ACCESS_KEY=test"
export AWS_SECRET_ACCESS_KEY=test

echo "AWS_SESSION_TOKEN=test"
export AWS_SESSION_TOKEN=test

export AWS_DEFAULT_REGION=us-east-1
echo "AWS_DEFAULT_REGION=us-east-1"

# Wait for LocalStack S3 to be ready
echo "Waiting for LocalStack S3..."
until (curl --silent http://localhost:4566/health | grep "\"s3\": \"\(running\|available\)\"" >/dev/null); do
  sleep 5
done
echo "LocalStack S3 is ready"

# Create S3 bucket if it doesn't exist
if ! aws --endpoint-url=http://localhost:4566 s3api head-bucket --bucket fragments 2>/dev/null; then
  echo "Creating LocalStack S3 bucket: fragments"
  aws --endpoint-url=http://localhost:4566 \
    s3api create-bucket --bucket fragments
else
  echo "S3 bucket 'fragments' already exists"
fi

# Setup DynamoDB Table with dynamodb-local
echo "Setting up DynamoDB-Local table: fragments"
if ! aws --endpoint-url=http://localhost:8000 dynamodb describe-table --table-name fragments 2>/dev/null; then
  echo "Creating DynamoDB table: fragments"
  aws --endpoint-url=http://localhost:8000 \
    dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
      AttributeName=ownerId,AttributeType=S \
      AttributeName=id,AttributeType=S \
    --key-schema \
      AttributeName=ownerId,KeyType=HASH \
      AttributeName=id,KeyType=RANGE \
    --provisioned-throughput \
      ReadCapacityUnits=10,WriteCapacityUnits=5
  
  # Wait until the table exists and is ready
  echo "Waiting for DynamoDB table to be ready..."
  aws --endpoint-url=http://localhost:8000 \
    dynamodb wait table-exists \
    --table-name fragments
  echo "DynamoDB table 'fragments' is ready"
else
  echo "DynamoDB table 'fragments' already exists"
fi

echo "Local AWS environment setup complete"
