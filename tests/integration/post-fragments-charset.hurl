# Posting with charset should work and GET returns same fragment type
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1

`Hello with charset!`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
# Capture created URL
[Captures]
url: header "Location"

# GET the fragment back
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/plain"
body == "Hello with charset!"