# Unsupported Content-Type should return 415
POST http://localhost:8080/v1/fragments
Content-Type: application/octet-stream
[BasicAuth]
user1@email.com:password1

`raw-bytes`

HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
jsonpath "$.error.message" == "Unsupported Content-Type"
header "Content-Type" contains "application/json"