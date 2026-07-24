import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/role/domain/app_role.dart';
import 'package:flutter/material.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({required this.onSelected, super.key});

  final ValueChanged<AppRole> onSelected;

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 28, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.ink,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Text(
                    'B11',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(width: 11),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'BASE11',
                      style: TextStyle(fontWeight: FontWeight.w900),
                    ),
                    Text(
                      'ROLE PREVIEW',
                      style: TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 44),
            Text(
              '어떤 화면을\n확인할까요?',
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(fontSize: 32),
            ),
            const SizedBox(height: 10),
            const Text(
              '실제 서비스에서는 초대와 승인된 권한에 따라\n해당 화면으로 자동 진입합니다.',
              style: TextStyle(color: AppColors.muted, height: 1.55),
            ),
            const SizedBox(height: 30),
            _RoleCard(
              role: AppRole.player,
              icon: Icons.sports_soccer_rounded,
              eyebrow: 'PLAYER',
              title: '선수로 보기',
              description: '오늘 훈련, 개인 미션, 피드백과 성장 기록',
              colors: const [Color(0xFF101828), Color(0xFF173E9D)],
              onTap: onSelected,
            ),
            const SizedBox(height: 12),
            _RoleCard(
              role: AppRole.parent,
              icon: Icons.family_restroom_rounded,
              eyebrow: 'PARENT',
              title: '학부모로 보기',
              description: '자녀 일정, 공지, 출결과 필요한 준비 정보',
              colors: const [Color(0xFF473A11), Color(0xFFB54708)],
              onTap: onSelected,
            ),
            const SizedBox(height: 12),
            _RoleCard(
              role: AppRole.coach,
              icon: Icons.sports_rounded,
              eyebrow: 'COACH',
              title: '지도자로 보기',
              description: '일정, 출석, 선수 상태와 팀 운영 업무',
              colors: const [Color(0xFF344054), Color(0xFF101828)],
              onTap: onSelected,
            ),
          ],
        ),
      ),
    ),
  );
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.role,
    required this.icon,
    required this.eyebrow,
    required this.title,
    required this.description,
    required this.colors,
    required this.onTap,
  });

  final AppRole role;
  final IconData icon;
  final String eyebrow;
  final String title;
  final String description;
  final List<Color> colors;
  final ValueChanged<AppRole> onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: title,
    child: InkWell(
      onTap: () => onTap(role),
      borderRadius: BorderRadius.circular(22),
      child: Ink(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: colors),
          borderRadius: BorderRadius.circular(22),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: .13),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: Colors.white),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    eyebrow,
                    style: const TextStyle(
                      color: Colors.white60,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_rounded, color: Colors.white),
          ],
        ),
      ),
    ),
  );
}
