import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/coach/domain/coach_models.dart';
import 'package:clubhaus_mobile/features/coach/presentation/widgets/coach_widgets.dart';
import 'package:flutter/material.dart';

class CoachManagementScreen extends StatelessWidget {
  const CoachManagementScreen({required this.snapshot, super.key});

  final CoachTeamSnapshot snapshot;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      key: const PageStorageKey('coach-management'),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
          sliver: SliverList.list(
            children: [
              const CoachPageHeader(
                eyebrow: 'TEAM OFFICE',
                title: '팀 관리',
                description: '공지, 피드백, 경기 기록과 팀 설정을 관리합니다.',
              ),
              const SizedBox(height: 20),
              _TeamProfile(snapshot: snapshot),
              const SizedBox(height: 26),
              const CoachSection(title: '지도자 업무', child: _ManagementMenu()),
              const SizedBox(height: 26),
              const CoachSection(title: '계정 및 팀 설정', child: _SettingsMenu()),
              const SizedBox(height: 18),
              Center(
                child: TextButton(
                  onPressed: () {},
                  child: const Text(
                    'BASE11 Coach · v0.1.0',
                    style: TextStyle(color: AppColors.muted, fontSize: 10),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _TeamProfile extends StatelessWidget {
  const _TeamProfile({required this.snapshot});
  final CoachTeamSnapshot snapshot;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF101828), Color(0xFF1D2939)],
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 58,
                height: 58,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFF781A25),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Text(
                  'A',
                  style: TextStyle(
                    color: Colors.white,
                    fontFamily: 'serif',
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      snapshot.teamName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      '${snapshot.season} · K리그 주니어 U18',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF98A2B3),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () {},
                tooltip: '팀 정보 수정',
                icon: const Icon(Icons.edit_outlined, color: Colors.white70),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.person_add_alt_1_rounded, size: 18),
                  label: const Text('팀원 초대'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(46),
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF475467)),
                  ),
                ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: FilledButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.visibility_outlined, size: 18),
                  label: const Text('팀 상세'),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(46),
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.ink,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ManagementMenu extends StatelessWidget {
  const _ManagementMenu();
  @override
  Widget build(BuildContext context) {
    return const CoachCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          _MenuRow(
            icon: Icons.campaign_outlined,
            color: AppColors.warning,
            background: Color(0xFFFFF6ED),
            title: '공지 센터',
            detail: '미확인 공지 2건',
            badge: '2',
          ),
          _MenuDivider(),
          _MenuRow(
            icon: Icons.track_changes_outlined,
            color: Color(0xFF6938EF),
            background: Color(0xFFF4F3FF),
            title: '선수 미션',
            detail: '이번 주 완료율 74%',
          ),
          _MenuDivider(),
          _MenuRow(
            icon: Icons.rate_review_outlined,
            color: AppColors.brand,
            background: Color(0xFFEFF4FF),
            title: '피드백',
            detail: '작성 대기 5건',
            badge: '5',
          ),
          _MenuDivider(),
          _MenuRow(
            icon: Icons.favorite_border_rounded,
            color: AppColors.danger,
            background: Color(0xFFFEF3F2),
            title: '컨디션·부상',
            detail: '관찰 선수 2명',
          ),
          _MenuDivider(),
          _MenuRow(
            icon: Icons.sports_soccer_rounded,
            color: AppColors.success,
            background: Color(0xFFECFDF3),
            title: '경기 기록',
            detail: '다음 경기 D-2',
          ),
        ],
      ),
    );
  }
}

class _SettingsMenu extends StatelessWidget {
  const _SettingsMenu();
  @override
  Widget build(BuildContext context) {
    return const CoachCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          _MenuRow(
            icon: Icons.group_outlined,
            color: AppColors.ink,
            background: Color(0xFFF2F4F7),
            title: '코칭스태프 및 권한',
            detail: '활성 스태프 5명',
          ),
          _MenuDivider(),
          _MenuRow(
            icon: Icons.notifications_none_rounded,
            color: AppColors.ink,
            background: Color(0xFFF2F4F7),
            title: '알림 설정',
            detail: '출석·컨디션 알림 사용 중',
          ),
          _MenuDivider(),
          _MenuRow(
            icon: Icons.settings_outlined,
            color: AppColors.ink,
            background: Color(0xFFF2F4F7),
            title: '팀 운영 설정',
            detail: '공개 범위와 자동화',
          ),
          _MenuDivider(),
          _MenuRow(
            icon: Icons.help_outline_rounded,
            color: AppColors.ink,
            background: Color(0xFFF2F4F7),
            title: '도움말 및 문의',
            detail: '가이드·고객지원',
          ),
        ],
      ),
    );
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({
    required this.icon,
    required this.color,
    required this.background,
    required this.title,
    required this.detail,
    this.badge,
  });
  final IconData icon;
  final Color color;
  final Color background;
  final String title;
  final String detail;
  final String? badge;
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {},
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 72),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: background,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 21),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      detail,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
              if (badge != null)
                Container(
                  height: 22,
                  constraints: const BoxConstraints(minWidth: 22),
                  alignment: Alignment.center,
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  decoration: BoxDecoration(
                    color: AppColors.danger,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    badge!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              const SizedBox(width: 4),
              const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
            ],
          ),
        ),
      ),
    );
  }
}

class _MenuDivider extends StatelessWidget {
  const _MenuDivider();
  @override
  Widget build(BuildContext context) =>
      const Divider(height: 1, indent: 67, endIndent: 14);
}
