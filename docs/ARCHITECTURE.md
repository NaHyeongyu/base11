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

## 핵심 도메인 모듈

1. `identity`: Cognito 사용자와 내부 사용자 연결
2. `organizations`: 클럽/학교와 시즌
3. `teams`: 팀, 선수단, 역할과 소속
4. `scheduling`: 훈련·경기·미팅·휴식 일정
5. `attendance`: 참석 응답과 실제 출석
6. `wellbeing`: 컨디션과 통증의 제한된 건강 정보
7. `announcements`: 공지, 대상, 읽음 상태
8. `feedback`: 개인 미션과 지도자 피드백
9. `matches`: 경기와 공식 기록
10. `media`: 사진·영상 메타데이터
11. `notifications`: 푸시·이메일 발송 요청

## 인증과 권한

Cognito는 인증만 담당합니다. 실제 접근 권한은 PostgreSQL의 `memberships`와 역할 정책으로 판정합니다. 모든 팀 데이터는 `organization_id`, `team_id`, `season_id` 범위 안에서 조회합니다.

## 계약

FastAPI의 OpenAPI가 API 계약의 원본입니다. 향후 `packages/api-contract`에서 Dart와 TypeScript 클라이언트를 생성하며, 앱에서 URL과 JSON 필드를 손으로 중복 정의하지 않습니다.

