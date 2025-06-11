import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, TrendingUp, Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalPurchases: 0,
    totalSales: 0,
    recentTransactions: [],
    chartData: {
      labels: [],
      datasets: {
        sales: [],
        purchases: []
      }
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('/api/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      }
    };

    fetchDashboardData();
  }, []);

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales and Purchases Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`
        }
      }
    }
  };

  const chartData = {
    labels: stats.chartData.labels,
    datasets: [
      {
        label: 'Sales',
        data: stats.chartData.datasets.sales,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4
      },
      {
        label: 'Purchases',
        data: stats.chartData.datasets.purchases,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      }
    ]
  };

  // Mock data for month selection and charts
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6">
      {/* Date selection */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">SELECT MONTH</label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">SELECT YEAR</label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-[400px]">
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard 
          title="Products" 
          value={stats.totalProducts} 
          icon={<Package className="text-blue-500" />} 
          bgColor="bg-blue-100" 
        />
        <StatsCard 
          title="Categories" 
          value={stats.totalCategories} 
          icon={<BarChart className="text-purple-500" />} 
          bgColor="bg-purple-100" 
        />
        <StatsCard 
          title="Suppliers" 
          value={stats.totalSuppliers} 
          icon={<Users className="text-green-500" />} 
          bgColor="bg-green-100" 
        />
        <StatsCard 
          title="Purchases" 
          value={stats.totalPurchases} 
          icon={<ShoppingCart className="text-yellow-500" />} 
          bgColor="bg-yellow-100" 
        />
        <StatsCard 
          title="Sales" 
          value={stats.totalSales} 
          icon={<DollarSign className="text-red-500" />} 
          bgColor="bg-red-100" 
        />
      </div>

      {/* Recent activities */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-cyan-700 text-white px-4 py-2 font-medium">
          Recent Transactions
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentTransactions.length > 0 ? (
            stats.recentTransactions.map((transaction: any) => (
              <div key={transaction._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{transaction.productName}</h4>
                    <p className="text-sm text-gray-600">
                      {transaction.type === 'purchase' ? 'Purchased from' : 'Sold to'}: {transaction.supplierName || 'Customer'}
                    </p>
                  </div>
                  <div>
                    <span className={`font-medium ${transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.type === 'purchase' ? '-' : '+'} ${transaction.total.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No recent transactions found</div>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, bgColor }) => (
  <div className={`${bgColor} rounded-lg shadow-md p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-white shadow-sm">
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm text-gray-600">
      <TrendingUp size={16} className="mr-1" />
      <span>Compared to last month</span>
    </div>
  </div>
);

export default Dashboard;