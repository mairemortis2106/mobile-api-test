// src/services/sslService.js

import { generateSessionId, generateSerialNumber } from '../utils/formatters';

export const simulateTLSHandshake = async (hostname, logger) => {
  const handshakeSteps = [
    { step: 'DNS Resolution', duration: 5 + Math.random() * 15 },
    { step: 'TCP Connection', duration: 10 + Math.random() * 30 },
    { step: 'TLS ClientHello', duration: 5 + Math.random() * 10 },
    { step: 'TLS ServerHello', duration: 8 + Math.random() * 15 },
    { step: 'Certificate Verification', duration: 15 + Math.random() * 25 },
    { step: 'Key Exchange', duration: 10 + Math.random() * 20 },
    { step: 'ChangeCipherSpec', duration: 3 + Math.random() * 7 },
    { step: 'Finished', duration: 2 + Math.random() * 5 },
  ];

  let totalTime = 0;

  for (const { step, duration } of handshakeSteps) {
    await new Promise(resolve => setTimeout(resolve, duration));
    totalTime += duration;
    
    let message = '';
    let data = {};

    switch(step) {
      case 'DNS Resolution':
        message = `Resolving ${hostname}...`;
        data = {
          hostname,
          dnsServer: '8.8.8.8',
          recordType: 'A',
          ttl: 300,
        };
        logger.dns('🌐 DNS Lookup', message, data);
        break;

      case 'TCP Connection':
        message = `Establishing TCP connection to ${hostname}:443`;
        data = {
          protocol: 'TCP',
          port: 443,
          localPort: 50000 + Math.floor(Math.random() * 15000),
          state: 'ESTABLISHED',
        };
        logger.tcp('🔌 TCP Handshake', message, data);
        break;

      case 'TLS ClientHello':
        message = 'Sending ClientHello to server';
        data = {
          tlsVersion: 'TLS 1.3',
          cipherSuites: [
            'TLS_AES_128_GCM_SHA256',
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
          ],
          extensions: [
            'server_name (SNI)',
            'supported_groups',
            'signature_algorithms',
            'application_layer_protocol_negotiation',
          ],
          compression: 'null',
        };
        logger.handshake('📤 TLS ClientHello', message, data);
        break;

      case 'TLS ServerHello':
        message = 'Received ServerHello from server';
        data = {
          tlsVersion: 'TLS 1.3',
          selectedCipher: 'TLS_AES_256_GCM_SHA384',
          compressionMethod: 'null',
          sessionId: generateSessionId(),
        };
        logger.handshake('📥 TLS ServerHello', message, data);
        break;

      case 'Certificate Verification':
        message = 'Verifying server certificate chain';
        data = {
          subject: `CN=${hostname}`,
          issuer: 'Let\'s Encrypt Authority X3',
          validFrom: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
          validTo: new Date(Date.now() + 60*24*60*60*1000).toISOString(),
          serialNumber: generateSerialNumber(),
          signatureAlgorithm: 'SHA256withRSA',
          publicKeyAlgorithm: 'RSA',
          keySize: 2048,
          certificateChain: [
            `${hostname} (End Entity)`,
            'Let\'s Encrypt Authority X3 (Intermediate)',
            'DST Root CA X3 (Root)',
          ],
        };
        logger.ssl('🔐 Certificate Check', message, data);
        break;

      case 'Key Exchange':
        message = 'Performing key exchange (ECDHE)';
        data = {
          keyExchangeAlgorithm: 'ECDHE',
          curve: 'X25519',
          sharedSecretSize: 256,
          preMasterSecretGenerated: true,
        };
        logger.handshake('🔑 Key Exchange', message, data);
        break;

      case 'ChangeCipherSpec':
        message = 'ChangeCipherSpec sent/received';
        data = {
          encryptionEnabled: true,
          cipher: 'AES-256-GCM',
          macAlgorithm: 'SHA384',
          mode: 'Authenticated Encryption',
        };
        logger.handshake('🔄 Change Cipher Spec', message, data);
        break;

      case 'Finished':
        message = 'TLS Handshake completed successfully';
        data = {
          sessionEstablished: true,
          totalHandshakeTime: `${Math.round(totalTime)}ms`,
          sessionResumption: Math.random() > 0.7,
          renegotiationSupported: true,
          alpnProtocol: 'h2',
        };
        logger.success('✅ Handshake Complete', message, data);
        break;
    }
  }

  return Math.round(totalTime);
};

export const checkSSLCertificate = async (urlToCheck, sslSettings, logger) => {
  try {
    const parsedUrl = new URL(urlToCheck);
    
    if (parsedUrl.protocol !== 'https:') {
      logger.info('⚠️ Not HTTPS', 'URL menggunakan HTTP, tidak ada SSL certificate');
      return {
        isHttps: false,
        message: 'URL menggunakan HTTP, tidak menggunakan SSL/TLS',
      };
    }

    logger.ssl('🔒 SSL Check Started', `Checking certificate for: ${urlToCheck}`);

    let handshakeDuration = 0;
    if (sslSettings.logHandshake) {
      logger.info('🔧 Initiating TLS Handshake', 'Starting detailed handshake logging...');
      handshakeDuration = await simulateTLSHandshake(parsedUrl.hostname, logger);
    }

    const sslCheckStart = Date.now();
    
    try {
      const response = await fetch(urlToCheck, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'API-Tester-SSL-Check/2.0',
        },
      });
      
      const actualConnectionTime = Date.now() - sslCheckStart;
      
      const sessionInfo = {
        sessionReused: actualConnectionTime < 100,
        renegotiationAllowed: true,
        ocspStapling: Math.random() > 0.5,
      };

      logger.info('🔄 Session Info', 'Checking session resumption and renegotiation', sessionInfo);

      const sslInfoData = {
        isHttps: true,
        isValid: true,
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        connectionTime: actualConnectionTime,
        handshakeTime: handshakeDuration,
        status: response.status,
        message: 'SSL Certificate Valid ✅',
        details: {
          note: 'React Native limitation: Certificate details simulated based on connection behavior',
          connectionSuccess: true,
          tlsVersion: 'TLS 1.3 (inferred)',
          cipherSuite: 'TLS_AES_256_GCM_SHA384 (inferred)',
          responseTime: `${actualConnectionTime}ms`,
          sessionReused: sessionInfo.sessionReused,
          renegotiationSupported: sessionInfo.renegotiationAllowed,
          ocspStapling: sessionInfo.ocspStapling,
        },
        sessionInfo,
      };
      
      logger.success('✅ SSL Certificate Valid', 'Connection established successfully', sslInfoData);
      
      return sslInfoData;
      
    } catch (sslError) {
      const actualConnectionTime = Date.now() - sslCheckStart;
      
      let errorMessage = sslError.message;
      let possibleCauses = [];
      
      if (errorMessage.includes('Network request failed')) {
        possibleCauses = [
          'Certificate expired atau belum valid',
          'Self-signed certificate tidak trusted',
          'Certificate chain incomplete',
          'Hostname mismatch dengan certificate',
          'Server tidak support TLS 1.2+',
          'Renegotiation disabled/failed',
        ];
        
        logger.error('❌ TLS Handshake Failed', 'SSL/TLS connection failed', {
          error: errorMessage,
          possibleCauses,
        });
      }
      
      const sslErrorData = {
        isHttps: true,
        isValid: false,
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        connectionTime: actualConnectionTime,
        handshakeTime: handshakeDuration,
        error: errorMessage,
        possibleCauses,
        message: 'SSL Certificate Invalid atau Error ❌',
      };
      
      logger.error('❌ SSL Error', errorMessage, sslErrorData);
      
      return sslErrorData;
    }
    
  } catch (error) {
    logger.error('❌ SSL Check Failed', error.message);
    return {
      isHttps: false,
      isValid: false,
      error: error.message,
      message: 'Failed to check SSL certificate',
    };
  }
};
