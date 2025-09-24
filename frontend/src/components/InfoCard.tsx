import React from 'react';
import type { InfoItem } from '../types';

interface InfoCardProps {
  title: string;
  icon: React.ReactNode;
  items: InfoItem[];
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, items }) => {
  return (
    <div className="info-card">
      <div className="info-card-header">
        <span className="info-card-icon">{icon}</span>
        <h3 className="info-card-title">{title}</h3>
      </div>
      <div className="info-card-content">
        {items.map((item, index) => (
          <div key={index} className="info-item">
            <span className="info-label">{item.label}:</span>
            <span className="info-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCard;
