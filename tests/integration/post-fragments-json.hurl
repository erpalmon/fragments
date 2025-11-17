# Posting a JSON fragment and GET it back
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

`{"hello":"world"}`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
[Captures]
url: header "Location"

# GET the JSON fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" contains "application/json"
body == "{\"hello\":\"world\"}"