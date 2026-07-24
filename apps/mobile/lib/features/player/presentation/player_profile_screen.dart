import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/player/domain/player_models.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class PlayerProfileScreen extends StatelessWidget {
  const PlayerProfileScreen({
    required this.snapshot,
    required this.onChangeRole,
    super.key,
  });
  final PlayerSnapshot snapshot;
  final VoidCallback onChangeRole;

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('player-profile'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: [
            const AppPageHeader(
              eyebrow: 'PLAYER PROFILE',
              title: '내 정보',
              description: '공식 기록과 공개 범위를 관리합니다.',
            ),
            const SizedBox(height: 22),
            _ProfileHero(snapshot: snapshot),
            const SizedBox(height: 14),
            const Row(
              children: [
                AppMetric(label: '시즌 경기', value: '12'),
                SizedBox(width: 8),
                AppMetric(label: '득점', value: '5', accent: AppColors.success),
                SizedBox(width: 8),
                AppMetric(label: '도움', value: '2', accent: AppColors.warning),
              ],
            ),
            const SizedBox(height: 26),
            const AppSection(title: '검증된 선수 정보', child: _VerifiedInfo()),
            const SizedBox(height: 26),
            AppSection(
              title: '계정 설정',
              child: AppCard(
                child: Column(
                  children: [
                    AppMenuRow(
                      icon: Icons.visibility_outlined,
                      title: '프로필 공개 범위',
                      subtitle: '팀 내부 공개 · 외부 비공개',
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    AppMenuRow(
                      icon: Icons.shield_outlined,
                      title: '보호자 연결',
                      subtitle: '나영희 보호자와 연결됨',
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    AppMenuRow(
                      icon: Icons.swap_horiz_rounded,
                      title: '역할 화면 전환',
                      subtitle: '지도자·선수·학부모 프리뷰',
                      onTap: onChangeRole,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ],
  );
}

class _ProfileHero extends StatelessWidget {
  const _ProfileHero({required this.snapshot});
  final PlayerSnapshot snapshot;
  @override
  Widget build(BuildContext context) => AppCard(
    color: AppColors.ink,
    borderColor: AppColors.ink,
    child: Row(
      children: [
        CircleAvatar(
          radius: 31,
          backgroundColor: const Color(0xFF1849A9),
          child: Text(
            '${snapshot.number}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
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
                snapshot.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'No.${snapshot.number} · ${snapshot.position} · ${snapshot.grade}',
                style: const TextStyle(color: Colors.white70, fontSize: 12),
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
                    '팀 인증 프로필',
                    style: TextStyle(
                      color: Color(0xFFB9E6FE),
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const Icon(Icons.edit_outlined, color: Colors.white70),
      ],
    ),
  );
}

class _VerifiedInfo extends StatelessWidget {
  const _VerifiedInfo();
  @override
  Widget build(BuildContext context) => const AppCard(
    child: Column(
      children: [
        _InfoRow(label: '소속', value: 'FC 안양 U18 · 2026 시즌'),
        Divider(height: 28),
        _InfoRow(label: '포지션', value: 'FW · 오른발'),
        Divider(height: 28),
        _InfoRow(label: '등록 상태', value: '팀 관리자 승인 완료'),
      ],
    ),
  );
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => Row(
    children: [
      SizedBox(
        width: 70,
        child: Text(
          label,
          style: const TextStyle(color: AppColors.muted, fontSize: 12),
        ),
      ),
      Expanded(
        child: Text(
          value,
          textAlign: TextAlign.right,
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
        ),
      ),
    ],
  );
}
