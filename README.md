# BASE11

엘리트 유소년 축구팀의 계획, 스태프 협업, 실행 데이터와 선수 목표를 연결하는 코칭 운영체제입니다.

> 선수의 다음을 만드는 팀의 베이스

## 기술 구성

- `apps/mobile`: 선수·학부모·코치용 Flutter 앱 (Android/iOS)
- `apps/web`: 코치·운영자용 Next.js 웹
- `apps/api`: Python FastAPI 모듈러 모놀리스와 비동기 작업 진입점
- `packages`: 플랫폼 간 공유하는 API 계약과 디자인 토큰
- `infra`: 로컬 Docker 및 AWS Terraform
- `docs`: 아키텍처 결정과 모듈화 규칙

## 빠른 시작

```bash
cp .env.example .env
make db-up
make db-migrate
make db-seed
make db-seed-year
make api-dev
make web-dev
make mobile-run
```

데이터베이스 준비 후 API와 프론트 명령은 별도 터미널에서 실행합니다. 전체 검증은 `make check`입니다. `make db-seed-year`는 FC 안양 U18의 2026년 선수단, 52주 계획, 훈련·경기, GPS 지표와 코칭 이력을 중복 없이 생성합니다.

## 버전 기준

- Flutter 3.38.9 / Dart 3.10.8
- Node.js 20.19.5
- Python 3.13.7
- PostgreSQL 17

프로젝트 전용 Flutter 래퍼는 `./.toolchains/flutter/bin/flutter`이며 `.toolchains`는 Git에 포함하지 않습니다. 일반 개발환경에서는 시스템 Flutter를 사용해도 됩니다.

## 설계 문서

- [제품 기획서](docs/product/PRODUCT_SPEC.md)
- [선수단 운영 정책](docs/product/SQUAD_OPERATIONS_POLICY.md)
- [아키텍처](docs/ARCHITECTURE.md)
- [모듈화 규칙](docs/MODULE_RULES.md)
- [로컬 개발환경](docs/LOCAL_SETUP.md)
- [기술 스택 결정](docs/adr/0001-platform-stack.md)
