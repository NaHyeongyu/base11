# 로컬 개발환경

## 설치 버전

- Flutter 3.38.9 / Dart 3.10.8
- Node.js 20.19.5 / npm 11.6.3
- Python 3.13.7
- Xcode 26.2 / CocoaPods 1.16.2
- Android SDK 36.1, platforms 34~36
- AWS CLI 2.35.20 / Docker 29.2.1

## 프로젝트 설치

```bash
cp .env.example .env
python3.13 -m venv .venv
make setup
```

Flutter 시스템 설치본의 권한 문제를 피하기 위해 현재 작업공간에는 Git에서 제외되는 프로젝트 전용 SDK 복사본과 래퍼가 준비되어 있습니다. 명령은 `make mobile-*`을 사용합니다.

## macOS에서 한 번만 필요한 플랫폼 설정

아래 명령은 시스템 영역을 변경하거나 약관 동의가 필요하므로 개발자가 터미널에서 직접 실행합니다.

```bash
sdkmanager --sdk_root="$HOME/Library/Android/sdk" "cmdline-tools;latest"
./.toolchains/flutter/bin/flutter doctor --android-licenses
sudo xcodebuild -runFirstLaunch
./.toolchains/flutter/bin/flutter doctor
```

iPhone 실기기는 잠금 해제, 개발자 모드, Mac 신뢰 설정이 필요합니다. Codex 격리 환경에서는 ADB와 Flutter 테스트 러너의 로컬 소켓이 차단되지만 일반 터미널에서는 동작합니다.

## 실행

```bash
make db-up
make api-dev
make web-dev
make mobile-run
```

