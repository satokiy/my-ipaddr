import { serve } from "bun";
import type { Server } from "bun";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// IPアドレスのタイプを判定
function getIpType(ip: string): string {
  // IPv6の判定
  if (ip.includes(":")) {
    // ::1 はローカルホストのIPv6
    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
      return "localhost";
    }
    return "IPv6";
  }
  // IPv4の判定
  else if (ip.includes(".")) {
    if (ip === "127.0.0.1" || ip.startsWith("::ffff:127.0.0.1")) {
      return "localhost";
    }
    return "IPv4";
  }
  return "Unknown";
}

// User-Agent解析
interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  os: string;
  isMobile: boolean;
  isDesktop: boolean;
  isBot: boolean;
}

function parseBrowserInfo(userAgent: string): BrowserInfo {
  const ua = userAgent.toLowerCase();
  
  // ブラウザ名とバージョンの検出
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
  
  // プラットフォームとOSの検出
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
  
  // デバイスタイプの判定
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
  };
}

// IPアドレス情報の型定義
interface IpInfo {
  ip: string;
  ipType: string;
  timestamp: string;
  headers: {
    userAgent: string | null;
    language: string | null;
    encoding: string | null;
    host: string | null;
  };
  browser: BrowserInfo;
}

const PORT = process.env.PORT || 5000;

const server: Server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    
    // CORS preflight request
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Health check endpoint
    if (url.pathname === "/api/health") {
      return Response.json(
        { status: "OK", timestamp: new Date().toISOString() },
        { headers: corsHeaders }
      );
    }
    
    // Main IP info endpoint
    if (url.pathname === "/api/ip-info") {
      // Get client IP address
      const forwarded = req.headers.get("x-forwarded-for");
      const clientIp = forwarded 
        ? forwarded.split(",")[0].trim()
        : server.requestIP(req)?.address || "Unknown";
      
      const cleanIp = clientIp.replace("::ffff:", ""); // IPv4-mapped IPv6アドレスをクリーンアップ
      
      const userAgent = req.headers.get("user-agent") || "";
      const browserInfo = parseBrowserInfo(userAgent);
      
      const ipInfo: IpInfo = {
        ip: cleanIp,
        ipType: getIpType(cleanIp),
        timestamp: new Date().toISOString(),
        headers: {
          userAgent: userAgent || null,
          language: req.headers.get("accept-language"),
          encoding: req.headers.get("accept-encoding"),
          host: req.headers.get("host"),
        },
        browser: browserInfo,
      };
      
      return Response.json(ipInfo, { headers: corsHeaders });
    }
    
    // 404 for other routes
    return new Response("Not Found", { 
      status: 404,
      headers: corsHeaders 
    });
  },
});

console.log(`🚀 Server is running on http://localhost:${PORT}`);
console.log(`📡 API endpoint: http://localhost:${PORT}/api/ip-info`);
