import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/player/domain/player_models.dart';
import 'package:clubhaus_mobile/features/player/presentation/player_controller.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class PlayerTodayScreen extends StatelessWidget {
  const PlayerTodayScreen({
    required this.snapshot,
    required this.controller,
    super.key,
  });

  final PlayerSnapshot snapshot;
  final PlayerController controller;

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('player-today'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: [
            _PlayerHeader(snapshot: snapshot),
            const SizedBox(height: 22),
            _SessionHero(
              activity: snapshot.activities.last,
              onSchedule: () => controller.selectTab(PlayerTab.schedule),
            ),
            const SizedBox(height: 18),
            _CheckInCard(controller: controller),
            const SizedBox(height: 26),
            AppSection(
              title: '오늘의 개인 미션',
              description: '지난 피드백에서 이어진 한 가지에 집중하세요.',
              child: _MissionCard(controller: controller),
            ),
            const SizedBox(height: 26),
            const AppSection(
              title: '코치 피드백',
              description: '7월 13일 · 부천FC U18전',
              child: _FeedbackCard(),
            ),
            const SizedBox(height: 26),
            const AppSection(title: '우리 팀 오늘', child: _TeamPulse()),
          ],
        ),
      ),
    ],
  );
}

class _PlayerHeader extends StatelessWidget {
  const _PlayerHeader({required this.snapshot});
  final PlayerSnapshot snapshot;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      Container(
        width: 46,
        height: 46,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF101828), Color(0xFF344054)],
          ),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Text(
          '${snapshot.number}',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 17,
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
              '${snapshot.name} 선수, 좋은 하루예요',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 3),
            Text(
              '${snapshot.teamName} · No.${snapshot.number} ${snapshot.position}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.muted, fontSize: 11),
            ),
          ],
        ),
      ),
      AppRoundButton(
        icon: Icons.notifications_none_rounded,
        label: '알림',
        badge: 2,
        onPressed: () {},
      ),
    ],
  );
}

class _SessionHero extends StatelessWidget {
  const _SessionHero({required this.activity, required this.onSchedule});
  final PlayerActivity activity;
  final VoidCallback onSchedule;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(22),
    decoration: BoxDecoration(
      gradient: const LinearGradient(
        colors: [Color(0xFF101828), Color(0xFF173E9D)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderRadius: BorderRadius.circular(24),
      boxShadow: const [
        BoxShadow(
          color: Color(0x26101828),
          blurRadius: 24,
          offset: Offset(0, 12),
        ),
      ],
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          children: [
            Icon(Icons.circle, color: Color(0xFF6CE9A6), size: 8),
            SizedBox(width: 7),
            Text(
              'TODAY · TRAINING',
              style: TextStyle(
                color: Color(0xFF84ADFF),
                fontSize: 10,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.1,
              ),
            ),
            Spacer(),
            Text(
              'D-DAY',
              style: TextStyle(color: Colors.white70, fontSize: 10),
            ),
          ],
        ),
        const SizedBox(height: 21),
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              activity.time,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 36,
                fontWeight: FontWeight.w900,
                letterSpacing: -1.5,
              ),
            ),
            const SizedBox(width: 9),
            Padding(
              padding: const EdgeInsets.only(bottom: 7),
              child: Text(
                '${activity.endTime} 종료',
                style: const TextStyle(color: Color(0xFFD0D5DD), fontSize: 12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          activity.title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 7),
        Row(
          children: [
            const Icon(
              Icons.location_on_outlined,
              color: Colors.white54,
              size: 17,
            ),
            const SizedBox(width: 5),
            Expanded(
              child: Text(
                '${activity.location} · ${activity.note}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Color(0xFFD0D5DD), fontSize: 11),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        OutlinedButton.icon(
          onPressed: onSchedule,
          icon: const Icon(Icons.calendar_month_outlined, size: 18),
          label: const Text('오늘 전체 일정 보기'),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(46),
            foregroundColor: Colors.white,
            side: const BorderSide(color: Color(0xFF475467)),
          ),
        ),
      ],
    ),
  );
}

class _CheckInCard extends StatelessWidget {
  const _CheckInCard({required this.controller});
  final PlayerController controller;

  @override
  Widget build(BuildContext context) => AppCard(
    borderColor: controller.checkInSaved
        ? const Color(0xFFABEFC6)
        : AppColors.line,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '훈련 전 체크인',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                  ),
                  SizedBox(height: 4),
                  Text(
                    '코치에게 오늘 상태를 알려주세요.',
                    style: TextStyle(color: AppColors.muted, fontSize: 11),
                  ),
                ],
              ),
            ),
            if (controller.checkInSaved)
              const AppPill(
                label: '전달 완료',
                foreground: AppColors.success,
                background: Color(0xFFECFDF3),
              ),
          ],
        ),
        const SizedBox(height: 17),
        const Text(
          '참여 여부',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children: ['참석', '지각', '결석']
              .map(
                (value) => ChoiceChip(
                  label: Text(value),
                  selected: controller.attendance == value,
                  onSelected: (_) => controller.setAttendance(value),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 15),
        const Text(
          '몸 상태',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children: ['좋음', '보통', '좋지 않음']
              .map(
                (value) => ChoiceChip(
                  label: Text(value),
                  selected: controller.condition == value,
                  onSelected: (_) => controller.setCondition(value),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 17),
        FilledButton.icon(
          onPressed: controller.saveCheckIn,
          icon: Icon(
            controller.checkInSaved ? Icons.check_rounded : Icons.send_rounded,
            size: 18,
          ),
          label: Text(controller.checkInSaved ? '상태를 전달했습니다' : '코치에게 상태 전달'),
        ),
      ],
    ),
  );
}

class _MissionCard extends StatelessWidget {
  const _MissionCard({required this.controller});
  final PlayerController controller;

  @override
  Widget build(BuildContext context) => AppCard(
    color: const Color(0xFFF4F7FF),
    borderColor: const Color(0xFFD1E0FF),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const AppPill(label: 'FIRST TOUCH'),
        const SizedBox(height: 13),
        const Text(
          '첫 터치를 진행 방향으로 두기',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 7),
        const Text(
          '공을 받기 전 주변을 확인하고 다음 플레이가 가능한 방향으로 첫 터치를 가져가세요.',
          style: TextStyle(color: AppColors.muted, fontSize: 12, height: 1.5),
        ),
        const SizedBox(height: 15),
        OutlinedButton.icon(
          onPressed: controller.toggleMission,
          icon: Icon(
            controller.missionComplete
                ? Icons.check_circle_rounded
                : Icons.radio_button_unchecked_rounded,
            size: 18,
          ),
          label: Text(controller.missionComplete ? '오늘 의식했어요' : '훈련 후 직접 체크'),
        ),
      ],
    ),
  );
}

class _FeedbackCard extends StatelessWidget {
  const _FeedbackCard();

  @override
  Widget build(BuildContext context) => const AppCard(
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 22,
          backgroundColor: Color(0xFF101828),
          child: Text(
            '김',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900),
          ),
        ),
        SizedBox(width: 13),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('김태호 감독', style: TextStyle(fontWeight: FontWeight.w900)),
              SizedBox(height: 6),
              Text(
                '수비 뒷공간으로 움직이는 타이밍이 좋아졌어. 다음에는 첫 터치 후 슈팅까지 더 빠르게 연결해보자.',
                style: TextStyle(fontSize: 12, height: 1.55),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _TeamPulse extends StatelessWidget {
  const _TeamPulse();

  @override
  Widget build(BuildContext context) => const Row(
    children: [
      AppMetric(label: '상태 응답', value: '24 / 26', accent: AppColors.success),
      SizedBox(width: 8),
      AppMetric(label: '다음 경기', value: 'D-2'),
      SizedBox(width: 8),
      AppMetric(label: '최근 5경기', value: '3승 1무'),
    ],
  );
}
