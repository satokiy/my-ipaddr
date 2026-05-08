export interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  os: string;
  isMobile: boolean;
  isDesktop: boolean;
  isBot: boolean;
}

export interface IpInfo {
  ipv4: string | null;
  ipv6: string | null;
  timestamp: string;
  headers: {
    userAgent: string | null;
    language: string | null;
    encoding: string | null;
    host: string | null;
  };
  browser: BrowserInfo;
}

export interface InfoItem {
  label: string;
  value: string;
}
