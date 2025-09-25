import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const RiskBadge = ({ riskLevel, riskScore }) => {
  const getRiskConfig = () => {
    switch (riskScore) {
      case 0:
        return {
          label: 'Low Risk',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          color: 'text-green-600'
        };
      case 1:
        return {
          label: 'Medium Risk',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
          color: 'text-yellow-600'
        };
      case 2:
        return {
          label: 'High Risk',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          color: 'text-red-600'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertTriangle,
          color: 'text-gray-600'
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      <Icon className={`w-3 h-3 ${config.color}`} />
      {config.label}
    </span>
  );
};

export default RiskBadge;