# 모듈화 규칙

## 공통 원칙

1. 앱은 서로의 소스 코드를 직접 import하지 않습니다.
2. API 계약과 디자인 토큰만 `packages`를 통해 공유합니다.
3. 기능 폴더는 `data/domain/presentation` 또는 `domain/application/infrastructure/api` 경계를 지킵니다.
4. 외부 SDK, HTTP, 데이터베이스 코드는 domain 계층에 들어가지 않습니다.
5. 한 모듈이 다른 모듈의 DB 테이블을 직접 수정하지 않습니다. 공개 application service 또는 도메인 이벤트를 사용합니다.
6. 파일은 하나의 주요 책임만 갖고, `utils`라는 포괄적 폴더는 만들지 않습니다.

## Flutter

```text
lib/
  app/                 앱 조립, 테마, 라우팅
  core/                네트워크, 설정, 저장소처럼 기능 중립 코드
  features/<feature>/
    data/               API DTO, repository 구현
    domain/             entity, repository 계약, use case
    presentation/       screen, widget, controller
  shared/               재사용 UI primitives
```

- feature 간 화면 위젯을 직접 import하지 않습니다.
- 상태는 화면이 아니라 feature controller가 소유합니다.
- 개인정보와 토큰은 일반 로컬 저장소에 두지 않습니다.

## Next.js

```text
src/
  app/                  route와 layout 조립
  features/<feature>/   기능별 model/api/ui
  shared/               디자인 시스템과 기반 라이브러리
```

- Server Component를 기본값으로 사용합니다.
- 브라우저 상호작용이 필요한 가장 작은 경계에만 `use client`를 둡니다.
- 서버 전용 secret은 `NEXT_PUBLIC_` 변수에 넣지 않습니다.

## FastAPI

```text
modules/<module>/
  domain/               순수 Python entity와 repository protocol
  application/          command/query와 유스케이스
  infrastructure/       SQLAlchemy, AWS, 외부 시스템 구현
  api/                  FastAPI router와 request/response schema
```

의존 방향은 `api -> application -> domain`이며 `infrastructure -> domain`입니다. domain은 FastAPI, SQLAlchemy, boto3를 import하지 않습니다.

## 완료 기준

- 모바일: `flutter analyze`, `flutter test`
- 웹: ESLint, TypeScript, production build
- API: Ruff, pytest, OpenAPI 생성
- 새 기능: 정상·빈 상태·오류·권한 없음·오프라인/재시도 상태 정의

