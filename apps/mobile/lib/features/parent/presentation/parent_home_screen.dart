import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/parent/domain/parent_models.dart';
import 'package:clubhaus_mobile/features/parent/presentation/parent_controller.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class ParentHomeScreen extends StatelessWidget {
  const ParentHomeScreen({
    required this.snapshot,
    required this.controller,
    super.key,
  });
  final ParentSnapshot snapshot;
  final ParentController controller;

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('parent-home'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: [
            _ParentHeader(snapshot: snapshot, controller: controller),
            const SizedBox(height: 20),
            _ChildSelector(snapshot: snapshot),
            const SizedBox(height: 14),
            _NextEventHero(
              event: snapshot.events.first,
              onSchedule: () => controller.selectTab(ParentTab.schedule),
            ),
            const SizedBox(height: 16),
            const _PreparationCard(),
            const SizedBox(height: 26),
            AppSection(
              title: '새 공지',
              description: '확인이 필요한 팀 소식 2건',
              action: TextButton(
                onPressed: () => controller.selectTab(ParentTab.notices),
                child: const Text('전체 보기'),
              ),
              child: _NoticePreview(
                notices: snapshot.notices,
                controller: controller,
              ),
            ),
            const SizedBox(height: 26),
            const AppSection(title: '민수의 이번 주', child: _ChildWeek()),
          ],
        ),
      ),
    ],
  );
}

class _ParentHeader extends StatelessWidget {
  const _ParentHeader({required this.snapshot, required this.controller});
  final ParentSnapshot snapshot;
  final ParentController controller;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'PARENT HOME',
              style: TextStyle(
                color: AppColors.warning,
                fontSize: 12,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              '${snapshot.parentName}님, 안녕하세요',
              style: const TextStyle(fontSize: 21, fontWeight: FontWeight.w900),
            ),
          ],
        ),
      ),
      AppRoundButton(
        icon: Icons.notifications_none_rounded,
        label: '알림',
        badge: 2,
        onPressed: () => controller.selectTab(ParentTab.notices),
      ),
    ],
  );
}

class _ChildSelector extends StatelessWidget {
  const _ChildSelector({required this.snapshot});
  final ParentSnapshot snapshot;

  @override
  Widget build(BuildContext context) => AppCard(
    padding: const EdgeInsets.all(14),
    child: Row(
      children: [
        const CircleAvatar(
          radius: 23,
          backgroundColor: Color(0xFFEFF4FF),
          child: Text(
            '11',
            style: TextStyle(
              color: AppColors.brand,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${snapshot.childName} 선수',
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 3),
              Text(
                '${snapshot.teamName} · FW · 3학년',
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
            ],
          ),
        ),
        const AppPill(
          label: '연결됨',
          foreground: AppColors.success,
          background: Color(0xFFECFDF3),
        ),
      ],
    ),
  );
}

class _NextEventHero extends StatelessWidget {
  const _NextEventHero({required this.event, required this.onSchedule});
  final ParentEvent event;
  final VoidCallback onSchedule;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(22),
    decoration: BoxDecoration(
      gradient: const LinearGradient(
        colors: [Color(0xFF473A11), Color(0xFFB54708)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderRadius: BorderRadius.circular(24),
      boxShadow: const [
        BoxShadow(
          color: Color(0x22B54708),
          blurRadius: 24,
          offset: Offset(0, 12),
        ),
      ],
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'TODAY · NEXT SCHEDULE',
          style: TextStyle(
            color: Color(0xFFFEC84B),
            fontSize: 12,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.1,
          ),
        ),
        const SizedBox(height: 20),
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              event.time,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 36,
                fontWeight: FontWeight.w900,
                letterSpacing: -1.3,
              ),
            ),
            const SizedBox(width: 9),
            Padding(
              padding: const EdgeInsets.only(bottom: 7),
              child: Text(
                event.meetTime,
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          event.title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            const Icon(
              Icons.location_on_outlined,
              color: Colors.white60,
              size: 16,
            ),
            const SizedBox(width: 5),
            Expanded(
              child: Text(
                event.location,
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),
        OutlinedButton.icon(
          onPressed: onSchedule,
          icon: const Icon(Icons.route_outlined, size: 18),
          label: const Text('일정과 준비물 확인'),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(46),
            foregroundColor: Colors.white,
            side: const BorderSide(color: Colors.white38),
          ),
        ),
      ],
    ),
  );
}

class _PreparationCard extends StatelessWidget {
  const _PreparationCard();
  @override
  Widget build(BuildContext context) => const AppCard(
    color: Color(0xFFFFFAEB),
    borderColor: Color(0xFFFEDF89),
    child: Row(
      children: [
        CircleAvatar(
          radius: 21,
          backgroundColor: Color(0xFFFEF0C7),
          child: Icon(Icons.backpack_outlined, color: AppColors.warning),
        ),
        SizedBox(width: 13),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('오늘 준비물', style: TextStyle(fontWeight: FontWeight.w900)),
              SizedBox(height: 4),
              Text(
                '검정 훈련복 · 축구화 · 개인 물병',
                style: TextStyle(color: AppColors.muted, fontSize: 12),
              ),
            ],
          ),
        ),
        Icon(Icons.check_circle_rounded, color: AppColors.success),
      ],
    ),
  );
}

class _NoticePreview extends StatelessWidget {
  const _NoticePreview({required this.notices, required this.controller});
  final List<ParentNotice> notices;
  final ParentController controller;

  @override
  Widget build(BuildContext context) => AppCard(
    child: Column(
      children: notices
          .take(2)
          .toList()
          .indexed
          .map(
            (entry) => Column(
              children: [
                InkWell(
                  onTap: () => controller.markRead(entry.$2.id),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(top: 5),
                          decoration: BoxDecoration(
                            color: controller.isRead(entry.$2.id)
                                ? AppColors.line
                                : AppColors.danger,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 11),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                entry.$2.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                entry.$2.preview,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: AppColors.muted,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.chevron_right_rounded,
                          color: AppColors.muted,
                        ),
                      ],
                    ),
                  ),
                ),
                if (entry.$1 == 0) const Divider(height: 26),
              ],
            ),
          )
          .toList(),
    ),
  );
}

class _ChildWeek extends StatelessWidget {
  const _ChildWeek();
  @override
  Widget build(BuildContext context) => const Row(
    children: [
      AppMetric(label: '훈련 참석', value: '3 / 3', accent: AppColors.success),
      SizedBox(width: 8),
      AppMetric(label: '다음 경기', value: 'D-2'),
      SizedBox(width: 8),
      AppMetric(label: '새 피드백', value: '1건', accent: AppColors.warning),
    ],
  );
}
