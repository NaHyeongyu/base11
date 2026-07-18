import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/parent/domain/parent_models.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class ParentChildScreen extends StatelessWidget {
  const ParentChildScreen({required this.snapshot, super.key});
  final ParentSnapshot snapshot;

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('parent-child'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: [
            const AppPageHeader(
              eyebrow: 'MY CHILD',
              title: '자녀',
              description: '선수가 공유하도록 승인된 정보만 표시합니다.',
            ),
            const SizedBox(height: 22),
            _ChildHero(snapshot: snapshot),
            const SizedBox(height: 14),
            const Row(
              children: [
                AppMetric(
                  label: '최근 출석률',
                  value: '96%',
                  accent: AppColors.success,
                ),
                SizedBox(width: 8),
                AppMetric(label: '시즌 경기', value: '12'),
                SizedBox(width: 8),
                AppMetric(
                  label: '새 피드백',
                  value: '1건',
                  accent: AppColors.warning,
                ),
              ],
            ),
            const SizedBox(height: 26),
            const AppSection(
              title: '오늘 상태',
              description: '선수가 코치에게 전달한 요약',
              child: _ConditionCard(),
            ),
            const SizedBox(height: 26),
            const AppSection(
              title: '최근 코치 피드백',
              description: '선수·지도자가 보호자 공개를 허용한 내용',
              child: _ParentFeedback(),
            ),
            const SizedBox(height: 26),
            const AppSection(title: '이번 시즌', child: _SeasonRecord()),
          ],
        ),
      ),
    ],
  );
}

class _ChildHero extends StatelessWidget {
  const _ChildHero({required this.snapshot});
  final ParentSnapshot snapshot;
  @override
  Widget build(BuildContext context) => AppCard(
    color: AppColors.ink,
    borderColor: AppColors.ink,
    child: Row(
      children: [
        const CircleAvatar(
          radius: 31,
          backgroundColor: Color(0xFF1849A9),
          child: Text(
            '11',
            style: TextStyle(
              color: Colors.white,
              fontSize: 21,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                snapshot.childName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${snapshot.teamName} · FW · 3학년',
                style: const TextStyle(color: Colors.white70, fontSize: 11),
              ),
              const SizedBox(height: 7),
              const Row(
                children: [
                  Icon(
                    Icons.verified_rounded,
                    color: Color(0xFF84ADFF),
                    size: 15,
                  ),
                  SizedBox(width: 5),
                  Text(
                    '팀 인증 선수',
                    style: TextStyle(color: Color(0xFFB9E6FE), fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
        ),
        const Icon(Icons.chevron_right_rounded, color: Colors.white54),
      ],
    ),
  );
}

class _ConditionCard extends StatelessWidget {
  const _ConditionCard();
  @override
  Widget build(BuildContext context) => const AppCard(
    child: Column(
      children: [
        Row(
          children: [
            CircleAvatar(
              radius: 23,
              backgroundColor: Color(0xFFECFDF3),
              child: Icon(
                Icons.sentiment_satisfied_alt_rounded,
                color: AppColors.success,
              ),
            ),
            SizedBox(width: 13),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '정상 참여 · 몸 상태 보통',
                    style: TextStyle(fontWeight: FontWeight.w900),
                  ),
                  SizedBox(height: 4),
                  Text(
                    '오늘 08:12 선수가 직접 입력',
                    style: TextStyle(color: AppColors.muted, fontSize: 10),
                  ),
                ],
              ),
            ),
            AppPill(
              label: '전달 완료',
              foreground: AppColors.success,
              background: Color(0xFFECFDF3),
            ),
          ],
        ),
        Divider(height: 28),
        Row(
          children: [
            Icon(Icons.lock_outline_rounded, color: AppColors.muted, size: 16),
            SizedBox(width: 7),
            Expanded(
              child: Text(
                '상세 통증 기록은 선수·지도자에게만 공개됩니다.',
                style: TextStyle(color: AppColors.muted, fontSize: 10),
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

class _ParentFeedback extends StatelessWidget {
  const _ParentFeedback();
  @override
  Widget build(BuildContext context) => const AppCard(
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 22,
          backgroundColor: AppColors.ink,
          child: Text(
            '김',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900),
          ),
        ),
        SizedBox(width: 13),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '김태호 감독 · 7월 13일',
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
              SizedBox(height: 6),
              Text(
                '최근 훈련에서 움직임과 집중력이 좋아지고 있습니다. 현재 개인 미션을 꾸준히 이어가고 있어요.',
                style: TextStyle(fontSize: 12, height: 1.55),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _SeasonRecord extends StatelessWidget {
  const _SeasonRecord();
  @override
  Widget build(BuildContext context) => const AppCard(
    child: Column(
      children: [
        _RecordRow(label: '공식 경기', value: '12경기'),
        Divider(height: 28),
        _RecordRow(label: '득점 · 도움', value: '5골 · 2도움'),
        Divider(height: 28),
        _RecordRow(label: '팀 활동', value: '입단 312일'),
      ],
    ),
  );
}

class _RecordRow extends StatelessWidget {
  const _RecordRow({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Row(
    children: [
      Text(label, style: const TextStyle(color: AppColors.muted, fontSize: 11)),
      const Spacer(),
      Text(value, style: const TextStyle(fontWeight: FontWeight.w900)),
    ],
  );
}
