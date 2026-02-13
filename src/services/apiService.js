// src/services/apiService.js

export const monitorNetworkActivity = async (url, options, logger) => {
  const parsedUrl = new URL(url);
  
  logger.dns('🌐 DNS Resolution', `Resolving ${parsedUrl.hostname}`, {
    hostname: parsedUrl.hostname,
    protocol: parsedUrl.protocol,
  });

  logger.tcp('🔌 Initiating Connection', `Connecting to ${parsedUrl.hostname}:${parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80)}`);

  const startTime = Date.now();
  const response = await fetch(url, options);
  const duration = Date.now() - startTime;

  logger.tcp('✅ Connection Established', `Connected in ${duration}ms`);

  return { response, duration };
};

export const sendAPIRequest = async (
  url, 
  method, 
  headers, 
  body, 
  sslSettings, 
  logger,
  sslCheckResult
) => {
  const startTime = Date.now();
  
  logger.request('📤 REQUEST START', `${method} ${url}`);

  try {
    const requestHeaders = {};
    headers.forEach((header) => {
      if (header.key && header.value) {
        requestHeaders[header.key] = header.value;
      }
    });

    const options = {
      method: method,
      headers: requestHeaders,
    };

    if (["POST", "PUT", "PATCH"].includes(method) && body) {
      options.body = body;
      if (!requestHeaders["Content-Type"]) {
        options.headers["Content-Type"] = "application/json";
      }
    }

    logger.info('🔧 Request Config', 'Headers & Body prepared', {
      headers: requestHeaders,
      body: options.body || null,
      sslVerify: sslSettings.verifySsl,
      timeout: sslSettings.timeout,
      followRedirects: sslSettings.followRedirects,
    });

    const payloadSize = options.body ? new TextEncoder().encode(options.body).length : 0;
    logger.info('📦 Payload Size', `Request body: ${payloadSize} bytes`);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), sslSettings.timeout);
    });

    logger.info('🚀 Sending HTTP Request', `${method} ${url}`);
    
    const { response: res, duration: requestDuration } = await Promise.race([
      monitorNetworkActivity(url, options, logger),
      timeoutPromise.then(() => { throw new Error('Request timeout'); })
    ]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.response('📥 RESPONSE RECEIVED', `Status: ${res.status} ${res.statusText} (${duration}ms)`);

    const responseHeaders = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    logger.info('📋 Response Headers', 'Received headers', {
      contentType: responseHeaders['content-type'],
      contentLength: responseHeaders['content-length'],
      server: responseHeaders['server'],
      date: responseHeaders['date'],
    });

    const securityHeaders = {
      'strict-transport-security': responseHeaders['strict-transport-security'] || null,
      'content-security-policy': responseHeaders['content-security-policy'] || null,
      'x-content-type-options': responseHeaders['x-content-type-options'] || null,
      'x-frame-options': responseHeaders['x-frame-options'] || null,
      'x-xss-protection': responseHeaders['x-xss-protection'] || null,
    };
    
    logger.info('🛡️ Security Headers', 'Checking security headers...', securityHeaders);

    let data;
    let rawResponse = "";
    const contentType = res.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      rawResponse = await res.text();
      try {
        data = JSON.parse(rawResponse);
        logger.success('✅ JSON Parsed', `Response successfully parsed (${rawResponse.length} chars)`, {
          size: rawResponse.length,
          type: 'JSON',
        });
      } catch (parseError) {
        logger.error('❌ JSON Parse Error', parseError.message);
        data = rawResponse;
      }
    } else {
      data = await res.text();
      logger.info('📝 Text Response', `Received ${data.length} characters`);
    }

    const responseSize = new TextEncoder().encode(rawResponse || JSON.stringify(data)).length;

    logger.info('⚡ Performance Metrics', 'Request completed', {
      totalDuration: `${duration}ms`,
      requestSize: `${payloadSize} bytes`,
      responseSize: `${responseSize} bytes`,
      throughput: `${((responseSize / 1024) / (duration / 1000)).toFixed(2)} KB/s`,
    });

    const responseData = {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      headers: responseHeaders,
      securityHeaders,
      data: data,
      duration: duration,
      size: responseSize,
      sslInfo: sslCheckResult,
      requestDetails: {
        url,
        method,
        headers: requestHeaders,
        body: options.body || null,
      },
    };

    logger.success('✅ Request Completed', `Successfully fetched data in ${duration}ms`);

    return { success: true, data: responseData };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    let errorType = "Unknown Error";
    let errorDetails = error.message;
    
    if (error.message.includes("timeout")) {
      errorType = "Timeout Error";
      errorDetails = `Request timeout setelah ${sslSettings.timeout}ms. Server terlalu lama respond.`;
      logger.error('⏱️ Timeout Error', errorDetails);
    } else if (error.message.includes("Network request failed")) {
      errorType = "Network Error";
      errorDetails = "Tidak bisa connect ke server. Kemungkinan:\n" +
        "• URL salah atau server down\n" +
        "• CORS issue (server tidak allow request dari mobile)\n" +
        "• Device tidak ada internet\n" +
        "• SSL/TLS handshake failed\n" +
        "• Server rejected renegotiation";
      
      logger.error('🔴 Network Error', errorDetails, {
        url,
        method,
        error: error.message,
        stack: error.stack,
      });
    } else if (error.message.includes("JSON")) {
      errorType = "Parse Error";
      errorDetails = "Response bukan JSON yang valid";
      logger.error('📝 JSON Parse Error', errorDetails);
    } else {
      logger.error('❌ Request Failed', error.message, {
        url,
        method,
        stack: error.stack,
      });
    }

    const errorResponse = {
      status: 0,
      statusText: "Error",
      ok: false,
      error: error.message,
      errorType: errorType,
      errorDetails: errorDetails,
      duration: duration,
      sslInfo: sslCheckResult,
      requestDetails: {
        url,
        method,
        headers: headers.reduce((acc, h) => {
          if (h.key && h.value) acc[h.key] = h.value;
          return acc;
        }, {}),
        body: body || null,
      },
    };

    return { success: false, data: errorResponse };
  }
};
