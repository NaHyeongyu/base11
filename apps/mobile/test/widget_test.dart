import 'package:clubhaus_mobile/app/app.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Future<void> openRole(WidgetTester tester, String label) async {
    await tester.pumpWidget(const ClubhausApp());
    await tester.pumpAndSettle();
    await tester.tap(find.text(label));
    await tester.pumpAndSettle();
  }

  testWidgets('role preview offers all supported experiences', (tester) async {
    await tester.pumpWidget(const ClubhausApp());
    await tester.pumpAndSettle();

    expect(find.text('선수로 보기'), findsOneWidget);
    expect(find.text('학부모로 보기'), findsOneWidget);
    expect(find.text('지도자로 보기'), findsOneWidget);
  });

  testWidgets('coach home shows team operations summary', (tester) async {
    await openRole(tester, '지도자로 보기');

    expect(find.text('FC 안양 U18'), findsOneWidget);
    expect(find.text('팀 전술 훈련'), findsOneWidget);
    expect(find.text('빠른 실행'), findsOneWidget);
    expect(find.text('출석'), findsOneWidget);
  });

  testWidgets('coach can move through operational tabs', (tester) async {
    await openRole(tester, '지도자로 보기');

    await tester.tap(
      find.descendant(
        of: find.byType(NavigationBar),
        matching: find.byIcon(Icons.fact_check_outlined),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('출석 현황'), findsOneWidget);
    expect(find.byIcon(Icons.qr_code_scanner_rounded), findsOneWidget);

    await tester.tap(
      find.descendant(
        of: find.byType(NavigationBar),
        matching: find.byIcon(Icons.groups_outlined),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('선수단'), findsWidgets);
    expect(find.byType(TextField), findsOneWidget);

    await tester.enterText(find.byType(TextField), '김민수');
    await tester.pumpAndSettle();
    expect(find.text('김민수'), findsWidgets);
    expect(find.text('박준호'), findsNothing);

    await tester.tap(
      find.descendant(
        of: find.byType(NavigationBar),
        matching: find.byIcon(Icons.grid_view_outlined),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('팀 관리'), findsOneWidget);
    expect(find.text('공지 센터'), findsOneWidget);
  });

  testWidgets('player can check in and review growth', (tester) async {
    await openRole(tester, '선수로 보기');

    expect(find.textContaining('김민수 선수'), findsOneWidget);
    expect(find.text('훈련 전 체크인'), findsOneWidget);

    await tester.tap(find.text('지각'));
    final saveCheckIn = find.text('코치에게 상태 전달');
    await tester.drag(
      find.byType(CustomScrollView).first,
      const Offset(0, -260),
    );
    await tester.pumpAndSettle();
    await tester.tap(saveCheckIn);
    await tester.pumpAndSettle();
    expect(find.text('상태를 전달했습니다'), findsOneWidget);

    await tester.tap(
      find.descendant(
        of: find.byType(NavigationBar),
        matching: find.byIcon(Icons.trending_up_outlined),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('성장 기록'), findsOneWidget);
    expect(find.text('피드백 타임라인'), findsOneWidget);
  });

  testWidgets('parent can review schedule notices and child summary', (
    tester,
  ) async {
    await openRole(tester, '학부모로 보기');

    expect(find.text('나영희님, 안녕하세요'), findsOneWidget);
    expect(find.text('오늘 준비물'), findsOneWidget);

    await tester.tap(
      find.descendant(
        of: find.byType(NavigationBar),
        matching: find.byIcon(Icons.campaign_outlined),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('오늘 훈련장 입구 변경 안내'), findsOneWidget);

    await tester.tap(
      find.descendant(
        of: find.byType(NavigationBar),
        matching: find.byIcon(Icons.family_restroom_outlined),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('오늘 상태'), findsOneWidget);
    expect(find.textContaining('상세 통증 기록'), findsOneWidget);
  });
}
