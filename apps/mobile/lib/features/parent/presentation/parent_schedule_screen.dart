import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/parent/domain/parent_models.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class ParentScheduleScreen extends StatelessWidget {
  const ParentScheduleScreen({required this.snapshot, super.key});
  final ParentSnapshot snapshot;

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('parent-schedule'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: [
            AppPageHeader(
              eyebrow: 'FAMILY SCHEDULE',
              title: '일정',
              description: '집합, 이동과 준비 정보를 한 번에 봅니다.',
              trailing: AppRoundButton(
                icon: Icons.calendar_today_rounded,
                label: '월간 달력',
                onPressed: () {},
              ),
            ),
            const SizedBox(height: 22),
            const _MonthSummary(),
            const SizedBox(height: 26),
            AppSection(
              title: '다가오는 일정',
              description: '김민수 · FC 안양 U18',
              child: Column(
                children: snapshot.events.indexed
                    .map(
                      (entry) => Padding(
                        padding: EdgeInsets.only(
                          bottom: entry.$1 == snapshot.events.length - 1
                              ? 0
                              : 10,
                        ),
                        child: _ParentEventCard(event: entry.$2),
                      ),
                    )
                    .toList(),
              ),
            ),
            const SizedBox(height: 26),
            const AppSection(title: '이동 안내', child: _TransportCard()),
          ],
        ),
      ),
    ],
  );
}

class _MonthSummary extends StatelessWidget {
  const _MonthSummary();
  @override
  Widget build(BuildContext context) => const AppCard(
    child: Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '2026년 7월',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
              ),
              SizedBox(height: 5),
              Text(
                '훈련 12 · 경기 4 · 휴식 6',
                style: TextStyle(color: AppColors.muted, fontSize: 12),
              ),
            ],
          ),
        ),
        AppPill(label: '이번 주 5개'),
      ],
    ),
  );
}

class _ParentEventCard extends StatelessWidget {
  const _ParentEventCard({required this.event});
  final ParentEvent event;
  @override
  Widget build(BuildContext context) => AppCard(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            AppPill(
              label: event.type,
              foreground: event.type == '경기'
                  ? AppColors.warning
                  : event.type == '휴식'
                  ? AppColors.success
                  : AppColors.brand,
              background: event.type == '경기'
                  ? const Color(0xFFFFF6ED)
                  : event.type == '휴식'
                  ? const Color(0xFFECFDF3)
                  : const Color(0xFFEFF4FF),
            ),
            const Spacer(),
            Text(
              event.date,
              style: const TextStyle(color: AppColors.muted, fontSize: 12),
            ),
          ],
        ),
        const SizedBox(height: 13),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 52,
              child: Text(
                event.time,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.title,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    '${event.location} · ${event.meetTime}',
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        if (event.preparation != null) ...[
          const Divider(height: 24),
          Row(
            children: [
              const Icon(
                Icons.backpack_outlined,
                size: 16,
                color: AppColors.warning,
              ),
              const SizedBox(width: 7),
              Expanded(
                child: Text(
                  event.preparation!,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    ),
  );
}

class _TransportCard extends StatelessWidget {
  const _TransportCard();
  @override
  Widget build(BuildContext context) => const AppCard(
    color: AppColors.ink,
    borderColor: AppColors.ink,
    child: Row(
      children: [
        CircleAvatar(
          radius: 23,
          backgroundColor: Color(0xFF344054),
          child: Icon(Icons.directions_bus_outlined, color: Colors.white),
        ),
        SizedBox(width: 13),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '수원 원정 클럽 버스',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                ),
              ),
              SizedBox(height: 4),
              Text(
                '12:10 안양종합운동장 출발 · 18:30 복귀 예정',
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
