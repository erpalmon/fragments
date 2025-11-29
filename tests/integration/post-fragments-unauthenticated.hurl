# Posting when not authenticated should return 401
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

`No auth here`

HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "Unauthorized"
header "Content-Type" contains "application/json"