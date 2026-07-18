# Infrastructure

`local`은 Docker Compose, AWS 환경은 Terraform으로 관리합니다. 콘솔에서 만든 리소스는 검증 후 코드로 반영합니다.

예정 환경:

- `dev`: 개발자 통합 환경
- `stage`: 출시 전 검증 환경
- `prod`: 운영 환경

AWS 계정과 도메인이 확정되기 전에는 실제 리소스를 생성하지 않습니다.

