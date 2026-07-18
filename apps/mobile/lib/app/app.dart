import 'package:clubhaus_mobile/app/theme/app_theme.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_shell.dart';
import 'package:flutter/material.dart';

class ClubhausApp extends StatelessWidget {
  const ClubhausApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BASE11',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const CoachShell(),
    );
  }
}
