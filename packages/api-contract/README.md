# API contract

FastAPI가 생성하는 `openapi.json`을 원본으로 사용합니다. Dart/TypeScript 생성 파일은 사람이 직접 수정하지 않습니다.

현재 계약 내보내기:

```text
make api-openapi
```

Dart와 TypeScript 클라이언트 생성은 인증·오류 envelope가 확정되는 시점에 추가합니다.
