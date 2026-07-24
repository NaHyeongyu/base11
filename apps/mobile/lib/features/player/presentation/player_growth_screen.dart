import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class PlayerGrowthScreen extends StatelessWidget {
  const PlayerGrowthScreen({super.key});

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('player-growth'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: const [
            AppPageHeader(
              eyebrow: 'MY GROWTH',
              title: '성장 기록',
              description: '근거가 있는 미션과 피드백만 모아봅니다.',
            ),
            SizedBox(height: 22),
            Row(
              children: [
                AppMetric(label: '미션 완료율', value: '74%'),
                SizedBox(width: 8),
                AppMetric(
                  label: '최근 출석률',
                  value: '96%',
                  accent: AppColors.success,
                ),
                SizedBox(width: 8),
                AppMetric(
                  label: '코치 피드백',
                  value: '12건',
                  accent: AppColors.warning,
                ),
              ],
            ),
            SizedBox(height: 26),
            AppSection(
              title: '이번 주 집중 목표',
              description: '코치가 승인한 개인 과제',
              child: _GoalCard(),
            ),
            SizedBox(height: 26),
            AppSection(
              title: '피드백 타임라인',
              description: '경기와 훈련에 연결된 기록',
              child: _FeedbackTimeline(),
            ),
            SizedBox(height: 26),
            AppSection(title: '커리어 순간', child: _CareerCard()),
          ],
        ),
      ),
    ],
  );
}

class _GoalCard extends StatelessWidget {
  const _GoalCard();
  @override
  Widget build(BuildContext context) => AppCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          children: [
            AppPill(label: 'WEEK 3'),
            Spacer(),
            Text('3 / 4회', style: TextStyle(fontWeight: FontWeight.w900)),
          ],
        ),
        const SizedBox(height: 16),
        const Text(
          '첫 터치를 진행 방향으로 두기',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 8),
        const Text(
          '지난 3회 훈련에서 스스로 체크했고, 코치 확인 2회를 받았습니다.',
          style: TextStyle(color: AppColors.muted, fontSize: 12, height: 1.5),
        ),
        const SizedBox(height: 15),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: const LinearProgressIndicator(
            value: .75,
            minHeight: 8,
            backgroundColor: Color(0xFFEAECF0),
            color: AppColors.brand,
          ),
        ),
      ],
    ),
  );
}

class _FeedbackTimeline extends StatelessWidget {
  const _FeedbackTimeline();
  @override
  Widget build(BuildContext context) {
    const items = [
      ('7.13', '부천FC U18전', '뒷공간 움직임의 타이밍이 좋아졌어.', AppColors.success),
      ('7.10', '팀 전술 훈련', '첫 터치 이후 슈팅 연결 속도를 높이자.', AppColors.brand),
      ('7.06', '서울이랜드 U18전', '수비 전환 시 첫 세 걸음이 빨라졌어.', AppColors.warning),
    ];
    return AppCard(
      child: Column(
        children: items.indexed
            .map(
              (entry) => Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        margin: const EdgeInsets.only(top: 5),
                        decoration: BoxDecoration(
                          color: entry.$2.$4,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 12),
                      SizedBox(
                        width: 36,
                        child: Text(
                          entry.$2.$1,
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              entry.$2.$2,
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              entry.$2.$3,
                              style: const TextStyle(
                                color: AppColors.muted,
                                fontSize: 12,
                                height: 1.45,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (entry.$1 != items.length - 1)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 14),
                      child: Divider(),
                    ),
                ],
              ),
            )
            .toList(),
      ),
    );
  }
}

class _CareerCard extends StatelessWidget {
  const _CareerCard();
  @override
  Widget build(BuildContext context) => const AppCard(
    color: AppColors.ink,
    borderColor: AppColors.ink,
    child: Row(
      children: [
        CircleAvatar(
          radius: 26,
          backgroundColor: Color(0xFF1849A9),
          child: Icon(Icons.emoji_events_rounded, color: Color(0xFFFEC84B)),
        ),
        SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'K리그 주니어 첫 득점',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                ),
              ),
              SizedBox(height: 4),
              Text(
                '2026년 5월 2일 · 대전하나시티즌 U18전',
                style: TextStyle(color: Colors.white60, fontSize: 12),
              ),
            ],
          ),
        ),
        Icon(Icons.chevron_right_rounded, color: Colors.white54),
      ],
    ),
  );
}
