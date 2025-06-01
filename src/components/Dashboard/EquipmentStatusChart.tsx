import { useEffect, useState } from 'react';
import { useEquipment } from '../../contexts/EquipmentContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { EquipmentStatus } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

const EquipmentStatusChart = () => {
  const { equipment } = useEquipment();
  
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [] as any[]
  });

  useEffect(() => {
    // Count equipment by status
    const statusCounts = {
      [EquipmentStatus.AVAILABLE]: 0,
      [EquipmentStatus.RENTED]: 0,
      [EquipmentStatus.MAINTENANCE]: 0,
      [EquipmentStatus.RETIRED]: 0
    };
    
    equipment.forEach(item => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }
    });
    
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    
    setChartData({
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)', // Available - Green
            'rgba(59, 130, 246, 0.7)', // Rented - Blue
            'rgba(249, 115, 22, 0.7)', // Maintenance - Orange
            'rgba(107, 114, 128, 0.7)'  // Retired - Gray
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(249, 115, 22)',
            'rgb(107, 114, 128)'
          ],
          borderWidth: 1
        }
      ]
    });
  }, [equipment]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Equipment by Status',
      },
    },
    cutout: '65%'
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full">
      <Doughnut options={options} data={chartData} />
    </div>
  );
};

export default EquipmentStatusChart;