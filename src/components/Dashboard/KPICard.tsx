import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const getColorClasses = (color: string) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };
  
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

const getIconColor = (color: string) => {
  const colorMap = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
    purple: 'text-purple-500'
  };
  
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  color 
}) => {
  const cardClasses = getColorClasses(color);
  const iconClasses = getIconColor(color);

  return (
    <div className={`rounded-lg border p-6 ${cardClasses} transition-all duration-200 hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
            </div>
          )}
          
          {description && (
            <p className="mt-2 text-sm opacity-80">{description}</p>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${iconClasses} bg-white bg-opacity-60`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;