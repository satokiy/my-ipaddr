import axios from 'axios';

// IPv6対応のIPアドレス取得サービス（CORS対応のものを優先）
const EXTERNAL_IP_SERVICES = [
  {
    name: 'ipify-v6',
    url: 'https://api64.ipify.org?format=json',
    supportsIPv6: true,
    corsEnabled: true,
    parseResponse: (data: any) => ({
      ip: data.ip,
      // IPv6アドレスは必ずコロンを含む
      ipType: data.ip.includes(':') ? 'IPv6' : 'IPv4'
    })
  },
  {
    name: 'ipify-v4',
    url: 'https://api.ipify.org?format=json',
    supportsIPv6: false,
    corsEnabled: true,
    parseResponse: (data: any) => ({
      ip: data.ip,
      ipType: 'IPv4'
    })
  },
  {
    name: 'ipapi.is',
    url: 'https://api.ipapi.is?format=json',
    supportsIPv6: true,
    corsEnabled: true,
    parseResponse: (data: any) => ({
      ip: data.ip,
      ipType: data.ip.includes(':') ? 'IPv6' : 'IPv4',
      city: data.location?.city,
      region: data.location?.state,
      country: data.location?.country,
      isp: data.asn?.org,
      timezone: data.location?.timezone
    })
  },
  {
    name: 'ipapi.co',
    url: 'https://ipapi.co/json/',
    supportsIPv6: true,
    corsEnabled: false, // CORS問題あり
    parseResponse: (data: any) => ({
      ip: data.ip,
      ipType: data.version || (data.ip.includes(':') ? 'IPv6' : 'IPv4'),
      city: data.city,
      region: data.region,
      country: data.country_name,
      isp: data.org,
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude
    })
  }
];

export interface ExternalIpInfo {
  ip: string;
  ipType: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

// IPv4とIPv6の両方を取得する関数
export const getExternalIpInfo = async (): Promise<ExternalIpInfo> => {
  let ipv4Info: ExternalIpInfo | null = null;
  let ipv6Info: ExternalIpInfo | null = null;
  
  // CORS対応のサービスを優先
  const corsEnabledServices = EXTERNAL_IP_SERVICES.filter(s => s.corsEnabled !== false);
  
  // IPv6を優先的に取得を試みる
  for (const service of corsEnabledServices) {
    if (!service.supportsIPv6) continue;
    
    try {
      const response = await axios.get(service.url, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const parsedData = service.parseResponse(response.data);
      
      // IPv6アドレスが取得できた場合（コロンを含むアドレス）
      if (parsedData.ip.includes(':')) {
        console.log(`IPv6 address retrieved from ${service.name}:`, parsedData);
        ipv6Info = { ...parsedData, ipType: 'IPv6' };
        return ipv6Info; // IPv6が見つかったらすぐに返す
      }
      // IPv4アドレスの場合は保存しておく
      else if (!ipv4Info) {
        console.log(`IPv4 address retrieved from ${service.name}:`, parsedData);
        ipv4Info = { ...parsedData, ipType: 'IPv4' };
      }
    } catch (error) {
      console.warn(`Failed to get IPv6 from ${service.name}:`, error);
      continue;
    }
  }
  
  // IPv6が取得できなかった場合で、IPv4もまだない場合は取得を試みる
  if (!ipv6Info && !ipv4Info) {
    for (const service of corsEnabledServices) {
      if (service.supportsIPv6) continue; // IPv6サービスはスキップ（すでに試した）
      
      try {
        const response = await axios.get(service.url, {
          timeout: 5000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        const parsedData = service.parseResponse(response.data);
        console.log(`IP info retrieved from ${service.name}:`, parsedData);
        
        // IPv4アドレスを保存
        if (!parsedData.ip.includes(':')) {
          ipv4Info = { ...parsedData, ipType: 'IPv4' };
          break;
        }
      } catch (error) {
        console.warn(`Failed to get IP from ${service.name}:`, error);
        continue;
      }
    }
  }
  
  // IPv6が優先、なければIPv4を返す
  const result = ipv6Info || ipv4Info;
  
  if (!result) {
    throw new Error('Failed to retrieve IP address from all services');
  }
  
  return result;
};

// デュアルスタック（IPv4とIPv6両方）を取得する関数
export const getDualStackIpInfo = async (): Promise<{ipv4?: ExternalIpInfo, ipv6?: ExternalIpInfo}> => {
  const results: {ipv4?: ExternalIpInfo, ipv6?: ExternalIpInfo} = {};
  
  // 並列で両方のIPアドレスを取得
  const promises = EXTERNAL_IP_SERVICES.map(async (service) => {
    try {
      const response = await axios.get(service.url, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const parsedData = service.parseResponse(response.data);
      
      if (parsedData.ipType === 'IPv6' && !results.ipv6) {
        results.ipv6 = parsedData;
      } else if (parsedData.ipType === 'IPv4' && !results.ipv4) {
        results.ipv4 = parsedData;
      }
    } catch (error) {
      // エラーは無視して続行
    }
  });
  
  await Promise.allSettled(promises);
  
  return results;
};

// ブラウザ情報を取得
export const getBrowserInfo = () => {
  const ua = navigator.userAgent.toLowerCase();
  
  let name = "Unknown";
  let version = "Unknown";
  
  if (ua.includes("chrome") && !ua.includes("edg")) {
    name = "Chrome";
    const match = ua.match(/chrome\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    name = "Safari";
    const match = ua.match(/version\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (ua.includes("firefox")) {
    name = "Firefox";
    const match = ua.match(/firefox\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (ua.includes("edg")) {
    name = "Edge";
    const match = ua.match(/edg\/(\d+\.\d+)/);
    if (match) version = match[1];
  }
  
  let platform = "Unknown";
  let os = "Unknown";
  
  if (ua.includes("mac")) {
    platform = "Apple Mac";
    os = "OS X";
  } else if (ua.includes("win")) {
    platform = "Windows";
    if (ua.includes("windows nt 10")) os = "Windows 10";
    else if (ua.includes("windows nt 11")) os = "Windows 11";
    else os = "Windows";
  } else if (ua.includes("linux")) {
    platform = "Linux";
    os = "Linux";
  } else if (ua.includes("android")) {
    platform = "Android";
    os = "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    platform = "iOS";
    os = "iOS";
  }
  
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(ua);
  const isBot = /bot|crawler|spider|crawling/i.test(ua);
  const isDesktop = !isMobile && !isBot;
  
  return {
    name,
    version,
    platform,
    os,
    isMobile,
    isDesktop,
    isBot,
    userAgent: navigator.userAgent
  };
};
