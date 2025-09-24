import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCopy, FiCheck, FiWifi, FiMonitor, FiSmartphone } from 'react-icons/fi';
import { getExternalIpInfo, getBrowserInfo } from './services/externalApi';
import IPDisplay from './components/IPDisplay';
import InfoCard from './components/InfoCard';
import LoadingSpinner from './components/LoadingSpinner';
import type { IpInfo } from './types';
import './styles/App.css';

function App(): React.JSX.Element {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchIpInfo = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // 外部APIから実際のIPアドレスを取得
      const externalData = await getExternalIpInfo();
      const browserInfo = getBrowserInfo();
      
      const data: IpInfo = {
        ip: externalData.ip,
        ipType: externalData.ipType,
        timestamp: new Date().toISOString(),
        headers: {
          userAgent: browserInfo.userAgent,
          language: navigator.language,
          encoding: null,
          host: window.location.host
        },
        browser: {
          name: browserInfo.name,
          version: browserInfo.version,
          platform: browserInfo.platform,
          os: browserInfo.os,
          isMobile: browserInfo.isMobile,
          isDesktop: browserInfo.isDesktop,
          isBot: browserInfo.isBot
        }
      };
      setIpInfo(data);
    } catch (err) {
      setError('IPアドレス情報の取得に失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (): void => {
    if (ipInfo?.ip) {
      navigator.clipboard.writeText(ipInfo.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = (): void => {
    fetchIpInfo();
  };

  const getDeviceIcon = (): React.JSX.Element => {
    if (!ipInfo?.browser) return <FiMonitor />;
    if (ipInfo.browser.isMobile) return <FiSmartphone />;
    return <FiMonitor />;
  };

  return (
    <div className="app">
      <div className="background-gradient"></div>
      
      <header className="app-header">
        <h1>
          <FiWifi className="header-icon" />
          My IP Address
        </h1>
        <p className="subtitle">あなたのグローバルIPアドレスと接続情報を確認</p>
      </header>

      <main className="app-main">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleRefresh} className="btn btn-primary">
              <FiRefreshCw /> 再試行
            </button>
          </div>
        ) : ipInfo ? (
          <>
            <IPDisplay 
              ip={ipInfo.ip} 
              ipType={ipInfo.ipType}
              onCopy={handleCopy}
              copied={copied}
            />

            <div className="action-buttons">
              <button 
                onClick={handleCopy} 
                className={`btn btn-copy ${copied ? 'copied' : ''}`}
              >
                {copied ? (
                  <>
                    <FiCheck /> コピーしました！
                  </>
                ) : (
                  <>
                    <FiCopy /> IPアドレスをコピー
                  </>
                )}
              </button>
              
              <button onClick={handleRefresh} className="btn btn-refresh">
                <FiRefreshCw /> 更新
              </button>
            </div>

            <div className="info-grid">
              <InfoCard 
                title="ブラウザ情報"
                icon={getDeviceIcon()}
                items={[
                  { label: 'ブラウザ', value: ipInfo.browser?.name || '不明' },
                  { label: 'バージョン', value: ipInfo.browser?.version || '不明' },
                  { label: 'プラットフォーム', value: ipInfo.browser?.platform || '不明' },
                  { label: 'OS', value: ipInfo.browser?.os || '不明' }
                ]}
              />

              <InfoCard 
                title="接続情報"
                icon={<FiWifi />}
                items={[
                  { label: 'IPタイプ', value: ipInfo.ipType },
                  { label: '言語', value: ipInfo.headers?.language?.split(',')[0] || '不明' },
                  { label: 'タイムスタンプ', value: new Date(ipInfo.timestamp).toLocaleString('ja-JP') }
                ]}
              />
            </div>

            <div className="user-agent-section">
              <h3>User Agent</h3>
              <div className="user-agent-text">
                {ipInfo.headers?.userAgent || '不明'}
              </div>
            </div>
          </>
        ) : null}
      </main>

      <footer className="app-footer">
        <p>© 2024 My IP Address - シンプルなIPアドレス確認ツール</p>
      </footer>
    </div>
  );
}

export default App;
