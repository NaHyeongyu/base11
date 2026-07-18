import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/parent/domain/parent_models.dart';
import 'package:clubhaus_mobile/features/parent/presentation/parent_controller.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class ParentNoticesScreen extends StatelessWidget {
  const ParentNoticesScreen({
    required this.snapshot,
    required this.controller,
    super.key,
  });
  final ParentSnapshot snapshot;
  final ParentController controller;

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('parent-notices'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: [
            const AppPageHeader(
              eyebrow: 'TEAM UPDATES',
              title: '공지',
              description: '팀의 공식 안내만 모아 확인합니다.',
            ),
            const SizedBox(height: 22),
            const Row(
              children: [
                AppMetric(label: '미확인', value: '2건', accent: AppColors.danger),
                SizedBox(width: 8),
                AppMetric(label: '중요', value: '2건', accent: AppColors.warning),
                SizedBox(width: 8),
                AppMetric(label: '이번 달', value: '11건'),
              ],
            ),
            const SizedBox(height: 24),
            ...snapshot.notices.map(
              (notice) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _NoticeCard(
                  notice: notice,
                  read: controller.isRead(notice.id),
                  onTap: () => controller.markRead(notice.id),
                ),
              ),
            ),
          ],
        ),
      ),
    ],
  );
}

class _NoticeCard extends StatelessWidget {
  const _NoticeCard({
    required this.notice,
    required this.read,
    required this.onTap,
  });
  final ParentNotice notice;
  final bool read;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: '${notice.title}${read ? ', 확인함' : ', 미확인'}',
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: AppCard(
        color: read ? AppColors.surface : const Color(0xFFFFFBFA),
        borderColor: read ? AppColors.line : const Color(0xFFFECDCA),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: notice.important
                    ? const Color(0xFFFEE4E2)
                    : const Color(0xFFEFF4FF),
                borderRadius: BorderRadius.circular(13),
              ),
              child: Icon(
                notice.important
                    ? Icons.campaign_outlined
                    : Icons.article_outlined,
                color: notice.important ? AppColors.danger : AppColors.brand,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      AppPill(
                        label: notice.category,
                        foreground: notice.important
                            ? AppColors.danger
                            : AppColors.brand,
                        background: notice.important
                            ? const Color(0xFFFEF3F2)
                            : const Color(0xFFEFF4FF),
                      ),
                      const Spacer(),
                      Text(
                        notice.time,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 9,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    notice.title,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    notice.preview,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                      height: 1.45,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 5),
            Icon(
              read ? Icons.check_circle_outline_rounded : Icons.circle,
              color: read ? AppColors.success : AppColors.danger,
              size: read ? 20 : 8,
            ),
          ],
        ),
      ),
    ),
  );
}
