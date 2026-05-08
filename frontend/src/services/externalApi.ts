import axios from 'axios';

// IPアドレス取得サービス（IPv4優先）
const EXTERNAL_IP_SERVICES = [
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
    name: 'ipify-v6',
    url: 'https://api64.ipify.org?format=json',
    supportsIPv6: true,
    corsEnabled: true,
    parseResponse: (data: any) => ({
      ip: data.ip,
      ipType: data.ip.includes(':') ? 'IPv6' : 'IPv4'
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

// IPアドレスを取得する関数（IPv4優先、フォールバックでIPv6）
export const getExternalIpInfo = async (): Promise<ExternalIpInfo> => {
  const corsEnabledServices = EXTERNAL_IP_SERVICES.filter(s => s.corsEnabled !== false);

  for (const service of corsEnabledServices) {
    try {
      const response = await axios.get(service.url, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      const parsedData = service.parseResponse(response.data);
      // IPv4が取得できたらすぐに返す
      if (!parsedData.ip.includes(':')) {
        return { ...parsedData, ipType: 'IPv4' };
      }
      // IPv6しか取れないサービスの結果は最後の手段として保持
      return { ...parsedData, ipType: 'IPv6' };
    } catch (error) {
      console.warn(`Failed to get IP from ${service.name}:`, error);
    }
  }

  throw new Error('Failed to retrieve IP address from all services');
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
