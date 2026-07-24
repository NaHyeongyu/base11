import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/parent/domain/parent_models.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class ParentMoreScreen extends StatelessWidget {
  const ParentMoreScreen({
    required this.snapshot,
    required this.onChangeRole,
    super.key,
  });
  final ParentSnapshot snapshot;
  final VoidCallback onChangeRole;

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('parent-more'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: [
            const AppPageHeader(
              eyebrow: 'PARENT ACCOUNT',
              title: '더보기',
              description: '연결된 자녀와 팀 설정을 관리합니다.',
            ),
            const SizedBox(height: 22),
            _AccountCard(snapshot: snapshot),
            const SizedBox(height: 26),
            AppSection(
              title: '팀 서비스',
              child: AppCard(
                child: Column(
                  children: [
                    AppMenuRow(
                      icon: Icons.shield_outlined,
                      title: 'FC 안양 U18 팀 정보',
                      subtitle: '지도자 5명 · 선수 26명',
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    AppMenuRow(
                      icon: Icons.photo_library_outlined,
                      title: '팀 앨범',
                      subtitle: '이번 달 새 사진 74장',
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    AppMenuRow(
                      icon: Icons.contact_phone_outlined,
                      title: '팀 연락처',
                      subtitle: '행정 담당자 및 긴급 연락',
                      onTap: () {},
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 26),
            AppSection(
              title: '계정 및 설정',
              child: AppCard(
                child: Column(
                  children: [
                    AppMenuRow(
                      icon: Icons.notifications_outlined,
                      title: '알림 설정',
                      subtitle: '일정 변경·중요 공지 알림 사용 중',
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    AppMenuRow(
                      icon: Icons.lock_outline_rounded,
                      title: '개인정보와 연결 권한',
                      subtitle: '자녀 1명 · 보호자 인증 완료',
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

class _AccountCard extends StatelessWidget {
  const _AccountCard({required this.snapshot});
  final ParentSnapshot snapshot;
  @override
  Widget build(BuildContext context) => AppCard(
    color: AppColors.ink,
    borderColor: AppColors.ink,
    child: Row(
      children: [
        const CircleAvatar(
          radius: 28,
          backgroundColor: Color(0xFF344054),
          child: Text(
            '나',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                snapshot.parentName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 19,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${snapshot.childName} 선수 보호자 · 인증 완료',
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
        ),
        const Icon(Icons.verified_user_outlined, color: Color(0xFF84ADFF)),
      ],
    ),
  );
}
