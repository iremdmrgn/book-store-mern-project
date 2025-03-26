// src/dashboard/components/RevenueChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueChart = ({ labels, dataValues }) => {
  // dataValues içindeki her değeri yuvarlayarak kullanıyoruz:
  const roundedDataValues = dataValues.map(value => Math.round(value));

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Revenue (USD)',
        data: roundedDataValues,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Revenue' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Y ekseninde de yuvarlanmış değerler gösterelim.
          callback: (value) => Math.round(value),
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default RevenueChart;
