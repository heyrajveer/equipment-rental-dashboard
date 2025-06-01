import { useEffect, useState } from 'react';
import { useRental } from '../../contexts/RentalContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { RentalStatus } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RentalChart = () => {
  const { rentals } = useRental();
  
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [] as any[]
  });

  useEffect(() => {
    // Get the last 6 months
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(month);
    }
    
    // Format labels
    const labels = months.map(month => month.toLocaleDateString('default', { month: 'short', year: 'numeric' }));
    
    // Initialize datasets
    const reserved = Array(6).fill(0);
    const rented = Array(6).fill(0);
    const returned = Array(6).fill(0);
    
    // Populate data
    rentals.forEach(rental => {
      const rentalStartDate = new Date(rental.startDate);
      
      // Find which month this rental belongs to
      months.forEach((month, index) => {
        if (
          rentalStartDate.getMonth() === month.getMonth() && 
          rentalStartDate.getFullYear() === month.getFullYear()
        ) {
          switch (rental.status) {
            case RentalStatus.RESERVED:
              reserved[index]++;
              break;
            case RentalStatus.RENTED:
            case RentalStatus.OVERDUE:
              rented[index]++;
              break;
            case RentalStatus.RETURNED:
              returned[index]++;
              break;
          }
        }
      });
    });
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Reserved',
          data: reserved,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Rented',
          data: rented,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        },
        {
          label: 'Returned',
          data: returned,
          backgroundColor: 'rgba(107, 114, 128, 0.5)',
          borderColor: 'rgb(107, 114, 128)',
          borderWidth: 1
        }
      ]
    });
  }, [rentals]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Rental Activity',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full">
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default RentalChart;