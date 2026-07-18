# ADR 0001: 플랫폼 기술 스택

- 상태: 승인
- 날짜: 2026-07-18

## 결정

- 모바일: Flutter/Dart, Android와 iOS 단일 코드베이스
- 코치 PC: Next.js/TypeScript
- 백엔드: Python/FastAPI와 PostgreSQL
- 클라우드: AWS Cognito, ECS Fargate, RDS, S3/CloudFront, SQS, CloudWatch
- 배포 전 구조: 모듈러 모놀리스

## 이유

모바일은 팀 브랜드를 반영한 일관된 UI와 세밀한 인터랙션이 중요합니다. 코치 PC는 표, 폼, 키보드와 브라우저 내비게이션이 중요하므로 Next.js를 별도로 사용합니다. FastAPI는 명시적인 OpenAPI 계약을 제공해 Dart와 TypeScript의 언어 차이를 완화합니다.

## 결과

세 언어를 운영하지만 모바일과 PC의 제품 특성을 각각 최적화합니다. 비즈니스 로직은 클라이언트에 중복하지 않고 API에 둡니다.

