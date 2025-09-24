import React from 'react';
import { FiGlobe } from 'react-icons/fi';

interface IPDisplayProps {
  ip: string;
  ipType: string;
  onCopy: () => void;
  copied: boolean;
}

const IPDisplay: React.FC<IPDisplayProps> = ({ ip, ipType }) => {
  const getIpTypeColor = (): string => {
    switch(ipType) {
      case 'IPv4':
        return '#4CAF50';
      case 'IPv6':
        return '#2196F3';
      case 'localhost':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className="ip-display">
      <div className="ip-display-header">
        <FiGlobe className="globe-icon" />
        <span className="ip-label">あなたのIPアドレス</span>
      </div>
      
      <div className="ip-address-container">
        <h2 className={`ip-address ${ipType === 'IPv6' ? 'ipv6' : ''}`}>
          {ip || '取得中...'}
        </h2>
        <span 
          className="ip-type-badge" 
          style={{ backgroundColor: getIpTypeColor() }}
        >
          {ipType}
        </span>
      </div>
    </div>
  );
};

export default IPDisplay;
