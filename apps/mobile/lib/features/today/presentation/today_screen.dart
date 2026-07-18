import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/today/data/today_repository.dart';
import 'package:clubhaus_mobile/features/today/domain/today_session.dart';
import 'package:clubhaus_mobile/shared/widgets/section_card.dart';
import 'package:flutter/material.dart';

class TodayScreen extends StatefulWidget {
  const TodayScreen({required this.repository, super.key});

  final TodayRepository repository;

  @override
  State<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends State<TodayScreen> {
  late final Future<TodaySession> _session = widget.repository.load();
  AttendanceChoice? _attendance;
  int _tabIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: FutureBuilder<TodaySession>(
          future: _session,
          builder: (context, snapshot) {
            if (snapshot.hasError) {
              return _ErrorState(onRetry: () => setState(() {}));
            }
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            return _TodayContent(
              session: snapshot.requireData,
              attendance: _attendance,
              onAttendanceChanged: (choice) =>
                  setState(() => _attendance = choice),
            );
          },
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tabIndex,
        onDestinationSelected: (index) => setState(() => _tabIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: '오늘',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            label: '일정',
          ),
          NavigationDestination(
            icon: Icon(Icons.groups_outlined),
            label: '우리 팀',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            label: '내 정보',
          ),
        ],
      ),
    );
  }
}

class _TodayContent extends StatelessWidget {
  const _TodayContent({
    required this.session,
    required this.attendance,
    required this.onAttendanceChanged,
  });

  final TodaySession session;
  final AttendanceChoice? attendance;
  final ValueChanged<AttendanceChoice> onAttendanceChanged;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
          sliver: SliverList.list(
            children: [
              _Header(session: session),
              const SizedBox(height: 24),
              _HeroSession(session: session),
              const SizedBox(height: 14),
              _AttendanceCard(
                choice: attendance,
                onChanged: onAttendanceChanged,
              ),
              const SizedBox(height: 14),
              _MissionCard(mission: session.mission),
              const SizedBox(height: 14),
              _NoticeCard(notice: session.notice),
            ],
          ),
        ),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.session});

  final TodaySession session;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                session.teamName,
                style: const TextStyle(
                  color: AppColors.brand,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                '${session.playerName} 선수, 좋은 하루예요',
                style: Theme.of(context).textTheme.titleLarge,
              ),
            ],
          ),
        ),
        Semantics(
          button: true,
          label: '알림 열기',
          child: const CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.surface,
            child: Icon(Icons.notifications_none, color: AppColors.ink),
          ),
        ),
      ],
    );
  }
}

class _HeroSession extends StatelessWidget {
  const _HeroSession({required this.session});

  final TodaySession session;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.ink,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x26101828),
            blurRadius: 22,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'TODAY · TRAINING',
            style: TextStyle(
              color: Color(0xFF84ADFF),
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                session.startTime,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 38,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -1.4,
                ),
              ),
              const SizedBox(width: 10),
              Padding(
                padding: const EdgeInsets.only(bottom: 7),
                child: Text(
                  session.meetTime,
                  style: const TextStyle(
                    color: Color(0xFFD0D5DD),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 9),
          Text(
            session.sessionTitle,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 7),
          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 18,
                color: Color(0xFF98A2B3),
              ),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  session.location,
                  style: const TextStyle(color: Color(0xFFD0D5DD)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AttendanceCard extends StatelessWidget {
  const _AttendanceCard({required this.choice, required this.onChanged});

  final AttendanceChoice? choice;
  final ValueChanged<AttendanceChoice> onChanged;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('오늘 참여 상태', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 5),
          const Text(
            '훈련 전에 코치에게 알려주세요.',
            style: TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 18),
          SegmentedButton<AttendanceChoice>(
            segments: const [
              ButtonSegment(
                value: AttendanceChoice.attending,
                label: Text('참석'),
              ),
              ButtonSegment(value: AttendanceChoice.late, label: Text('지각')),
              ButtonSegment(value: AttendanceChoice.absent, label: Text('결석')),
            ],
            selected: choice == null ? <AttendanceChoice>{} : {choice!},
            emptySelectionAllowed: true,
            showSelectedIcon: false,
            onSelectionChanged: (selection) {
              if (selection.isNotEmpty) onChanged(selection.first);
            },
            style: const ButtonStyle(visualDensity: VisualDensity(vertical: 2)),
          ),
        ],
      ),
    );
  }
}

class _MissionCard extends StatelessWidget {
  const _MissionCard({required this.mission});

  final String mission;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CircleAvatar(
            backgroundColor: Color(0xFFEFF4FF),
            foregroundColor: AppColors.brand,
            child: Icon(Icons.track_changes),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '오늘의 개인 미션',
                  style: TextStyle(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 7),
                Text(mission, style: Theme.of(context).textTheme.bodyLarge),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NoticeCard extends StatelessWidget {
  const _NoticeCard({required this.notice});

  final String notice;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Row(
        children: [
          const Icon(Icons.campaign_outlined, color: AppColors.warning),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              notice,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.muted),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.cloud_off_outlined,
              size: 42,
              color: AppColors.muted,
            ),
            const SizedBox(height: 16),
            Text(
              '오늘 정보를 불러오지 못했어요',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            const Text('인터넷 연결을 확인하고 다시 시도해주세요.'),
            const SizedBox(height: 20),
            FilledButton(onPressed: onRetry, child: const Text('다시 시도')),
          ],
        ),
      ),
    );
  }
}
