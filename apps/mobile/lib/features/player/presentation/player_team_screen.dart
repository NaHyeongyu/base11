import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class PlayerTeamScreen extends StatelessWidget {
  const PlayerTeamScreen({super.key});

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('player-team'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: const [
            AppPageHeader(
              eyebrow: 'MY TEAM',
              title: '우리 팀',
              description: '같은 목표와 기록이 쌓이는 팀 공간입니다.',
            ),
            SizedBox(height: 22),
            _TeamIdentity(),
            SizedBox(height: 14),
            Row(
              children: [
                AppMetric(label: '리그 순위', value: '2위'),
                SizedBox(width: 8),
                AppMetric(
                  label: '시즌 전적',
                  value: '8-2-2',
                  accent: AppColors.success,
                ),
                SizedBox(width: 8),
                AppMetric(
                  label: '팀 출석률',
                  value: '93%',
                  accent: AppColors.warning,
                ),
              ],
            ),
            SizedBox(height: 26),
            AppSection(
              title: '팀원',
              description: 'FC 안양 U18 · 등록 선수 26명',
              child: _Teammates(),
            ),
            SizedBox(height: 26),
            AppSection(
              title: '팀 타임라인',
              description: '경기와 팀의 순간을 함께 봅니다.',
              child: _TeamFeed(),
            ),
          ],
        ),
      ),
    ],
  );
}

class _TeamIdentity extends StatelessWidget {
  const _TeamIdentity();
  @override
  Widget build(BuildContext context) => const AppCard(
    color: Color(0xFF781A25),
    borderColor: Color(0xFF781A25),
    child: Row(
      children: [
        CircleAvatar(
          radius: 29,
          backgroundColor: Colors.white,
          child: Text(
            'A',
            style: TextStyle(
              color: Color(0xFF781A25),
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'FC 안양 U18',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 19,
                  fontWeight: FontWeight.w900,
                ),
              ),
              SizedBox(height: 4),
              Text(
                '2026 시즌 · K리그 주니어 U18',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
        ),
        Icon(Icons.verified_rounded, color: Color(0xFFB9E6FE)),
      ],
    ),
  );
}

class _Teammates extends StatelessWidget {
  const _Teammates();
  @override
  Widget build(BuildContext context) {
    const players = [
      ('1', '정현우', 'GK'),
      ('4', '이도윤', 'DF'),
      ('7', '박준호', 'MF'),
      ('11', '김민수', 'FW'),
      ('14', '한지민', 'MF'),
      ('18', '최우진', 'FW'),
    ];
    return AppCard(
      child: Wrap(
        spacing: 14,
        runSpacing: 18,
        children: players
            .map(
              (player) => SizedBox(
                width: 72,
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 25,
                      backgroundColor: const Color(0xFFEFF4FF),
                      child: Text(
                        player.$1,
                        style: const TextStyle(
                          color: AppColors.brand,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(height: 7),
                    Text(
                      player.$2,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      player.$3,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _TeamFeed extends StatelessWidget {
  const _TeamFeed();
  @override
  Widget build(BuildContext context) => const AppCard(
    child: Column(
      children: [
        _FeedRow(
          icon: Icons.emoji_events_rounded,
          color: AppColors.warning,
          title: '부천FC U18전 2:1 승리',
          subtitle: '7월 13일 · 경기 결과와 감독 총평',
        ),
        Divider(height: 28),
        _FeedRow(
          icon: Icons.photo_library_outlined,
          color: AppColors.brand,
          title: '원정 경기 사진 32장',
          subtitle: '7월 13일 · 팀 앨범',
        ),
        Divider(height: 28),
        _FeedRow(
          icon: Icons.campaign_outlined,
          color: AppColors.success,
          title: '이번 주 팀 목표',
          subtitle: '수비 전환 5초 원칙을 함께 지키기',
        ),
      ],
    ),
  );
}

class _FeedRow extends StatelessWidget {
  const _FeedRow({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
  });
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  @override
  Widget build(BuildContext context) => Row(
    children: [
      Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: color.withValues(alpha: .1),
          borderRadius: BorderRadius.circular(13),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      const SizedBox(width: 12),
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 3),
            Text(
              subtitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.muted, fontSize: 12),
            ),
          ],
        ),
      ),
      const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
    ],
  );
}
