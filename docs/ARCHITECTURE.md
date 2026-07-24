# 아키텍처

## 배포 단위

```text
Flutter Android/iOS ─┐
                     ├─ HTTPS / JSON ─ FastAPI ─ PostgreSQL
Next.js Coach Web ───┘                    │
                                          ├─ S3 / CloudFront
                                          └─ SQS worker
```

초기에는 FastAPI를 모듈러 모놀리스로 유지합니다. 팀 30~100개와 사용자 1만 명 규모에서 서비스 경계를 먼저 분산 시스템으로 쪼개면 운영 복잡성이 더 커집니다. 트래픽과 조직 규모가 실제로 요구할 때 모듈별로 분리합니다.

## 현재 핵심 도메인

`TrainingSession`이 데이터의 중심입니다. 일정, 훈련 블록, 스태프 검토, 선수 이슈, GPS 성과 데이터와 역할별 공개본이 같은 세션을 참조합니다. 별도 출석 모듈은 두지 않습니다.

1. `identity`: Cognito 사용자와 내부 사용자의 분리된 인증 어댑터
2. `organizations / teams`: 클럽, 시즌, 선수단, 역할과 소속
3. `matches / microcycles / sessions`: 경기 기준 주간 계획과 훈련 블록
4. `staff_reviews`: 지도자 제안과 감독의 수락·유지·거절 결정 기록
5. `player_goals / player_issues`: 선수 목표, 피드백, 통증·제한 사항
6. `performance_imports`: GPS·RPE 업체별 CSV/Excel 컬럼을 공통 지표로 적재
7. `publications`: 선수·스태프·학부모별로 노출 범위를 분리한 세션 공개본
8. `change_logs`: 계획 변경과 결정의 감사 이력

## 인증과 권한

Cognito는 인증만 담당합니다. 실제 접근 권한은 PostgreSQL의 `team_memberships`와 역할 정책으로 판정합니다. 모든 API는 로그인 사용자의 팀 소속을 먼저 검사하며 감독 전용 결정·공개 권한을 별도로 제한합니다. 로컬 개발은 고정 지도자 ID를 사용하고, Cognito 검증기는 배포 어댑터로 교체합니다.

동시에 두 지도자가 같은 세션을 수정하는 경우 `version` 기반 낙관적 잠금으로 늦게 저장한 요청에 `409 Conflict`를 반환합니다. 공개 시 내부 메모는 선수와 학부모 payload에 포함되지 않습니다.

## 계약

FastAPI의 OpenAPI가 API 계약의 원본입니다. 향후 `packages/api-contract`에서 Dart와 TypeScript 클라이언트를 생성하며, 앱에서 URL과 JSON 필드를 손으로 중복 정의하지 않습니다.
