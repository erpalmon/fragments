#!/bin/sh

echo "Setting AWS environment variables for LocalStack"

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1

echo 'Waiting for LocalStack S3...'
until (curl --silent http://localhost:4566/_localstack/health \
  | grep "\"s3\": \"\(running\|available\)\"" > /dev/null); do
    sleep 5
done
echo 'LocalStack S3 Ready'

# Create S3 bucket if missing
if ! aws --endpoint-url=http://localhost:4566 s3api head-bucket --bucket fragments 2>/dev/null; then
  echo "Creating bucket: fragments"
  aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fragments
fi

# Create DynamoDB table if missing
if ! aws --endpoint-url=http://localhost:8000 dynamodb describe-table --table-name fragments >/dev/null 2>&1; then
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
      --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5

  aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name fragments
fi

# Insert 2 fragments with STRING ids (fix for Hurl test mismatch)
echo "Seeding two fragments"

aws --endpoint-url=http://localhost:8000 dynamodb put-item \
  --table-name fragments \
  --item "{
    \"ownerId\": {\"S\": \"ellapalmon\"},
    \"id\": {\"S\": \"seed-frag-1\"},
    \"type\": {\"S\": \"text/plain\"},
    \"size\": {\"N\": \"5\"}
  }"

aws --endpoint-url=http://localhost:8000 dynamodb put-item \
  --table-name fragments \
  --item "{
    \"ownerId\": {\"S\": \"ellapalmon\"},
    \"id\": {\"S\": \"seed-frag-2\"},
    \"type\": {\"S\": \"text/plain\"},
    \"size\": {\"N\": \"5\"}
  }"
