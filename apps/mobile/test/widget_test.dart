import 'package:clubhaus_mobile/app/app.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('today screen shows team and training session', (tester) async {
    await tester.pumpWidget(const ClubhausApp());
    await tester.pumpAndSettle();

    expect(find.text('FC 안양 U18'), findsOneWidget);
    expect(find.text('팀 전술 훈련'), findsOneWidget);
    expect(find.text('오늘 참여 상태'), findsOneWidget);
  });
}

