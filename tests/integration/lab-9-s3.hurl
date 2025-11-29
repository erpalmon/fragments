# Lab 9 S3 end-to-end test

# 1) POST a new text fragment as an authorized user
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Hello S3!`

# Expect 201 and capture Location
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
[Captures]
url: header "Location"

# 2) GET the fragment using the captured URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/plain"
body == "Hello S3!"

# 3) DELETE the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# 4) Confirm it’s gone
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404