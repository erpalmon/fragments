# Test DynamoDB Integration
# This test verifies CRUD operations on fragments using DynamoDB

# 1. Create a new JSON fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: application/json

{ "service": "DynamoDB" }

HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 2. Get the first fragment's metadata
GET {{fragment1_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.ownerId" exists
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25  # The actual size of the stored fragment

# 3. Create a second Markdown fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/markdown

```
DynamoDB is **great**.
```

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 4. Get the second fragment's metadata
GET {{fragment2_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.ownerId" exists
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 23  # The actual size of the stored markdown

# 5. Get all fragments (just IDs)
GET http://localhost:8080/v1/fragments?expand=false
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" count >= 2
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# 6. Delete the first fragment
DELETE {{fragment1_url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200

# 7. Verify the first fragment is deleted
GET {{fragment1_url}}/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 500

# 8. Verify the first fragment is no longer in the list and the second fragment remains
GET http://localhost:8080/v1/fragments?expand=false
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"