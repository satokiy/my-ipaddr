import React from 'react';
import { FiGlobe } from 'react-icons/fi';

interface IPDisplayProps {
  ipv4: string | null;
  ipv6: string | null;
}

const IPDisplay: React.FC<IPDisplayProps> = ({ ipv4, ipv6 }) => {
  return (
    <div className="ip-display">
      <div className="ip-display-header">
        <FiGlobe className="globe-icon" />
        <span className="ip-label">あなたのIPアドレス</span>
      </div>

      <div className="ip-rows">
        <div className="ip-row">
          <span className="ip-type-badge ipv4-badge">IPv4</span>
          <h2 className="ip-address">
            {ipv4 ?? '未取得'}
          </h2>
        </div>
        <div className="ip-row">
          <span className="ip-type-badge ipv6-badge">IPv6</span>
          <h2 className="ip-address ipv6">
            {ipv6 ?? '未取得'}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default IPDisplay;
