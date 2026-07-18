import 'dart:convert';
import 'dart:io';

import 'package:clubhaus_mobile/core/config/app_config.dart';

class ApiException implements Exception {
  const ApiException(this.statusCode, this.message);

  final int statusCode;
  final String message;
}

class ApiClient {
  ApiClient({HttpClient? httpClient}) : _httpClient = httpClient ?? HttpClient();

  final HttpClient _httpClient;

  Future<Object?> get(String path) async {
    final request = await _httpClient.getUrl(Uri.parse('${AppConfig.apiBaseUrl}$path'));
    request.headers.set(HttpHeaders.acceptHeader, 'application/json');
    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(response.statusCode, body);
    }

    return body.isEmpty ? null : jsonDecode(body);
  }

  void close() => _httpClient.close(force: true);
}

