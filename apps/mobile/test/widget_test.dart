import 'package:clubhaus_mobile/app/app.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('coach home shows team operations summary', (tester) async {
    await tester.pumpWidget(const ClubhausApp());
    await tester.pumpAndSettle();

    expect(find.text('FC 안양 U18'), findsOneWidget);
    expect(find.text('팀 전술 훈련'), findsOneWidget);
    expect(find.text('빠른 실행'), findsOneWidget);
    expect(find.text('출석'), findsOneWidget);
  });

  testWidgets('coach can move through operational tabs', (tester) async {
    await tester.pumpWidget(const ClubhausApp());
    await tester.pumpAndSettle();

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
}
