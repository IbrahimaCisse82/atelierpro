import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function PayrollBarChart({ labels, data, title }: { labels: string[], data: number[], title: string }) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: title,
            data,
            backgroundColor: 'rgba(59,130,246,0.7)',
            borderRadius: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: title },
        },
        scales: {
          y: { beginAtZero: true },
        },
      }}
    />
  );
}

export function PayrollDonutChart({ labels, data, title }: { labels: string[], data: number[], title: string }) {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <canvas id="payroll-donut" />
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: title,
              data,
              backgroundColor: [
                'rgba(59,130,246,0.7)',
                'rgba(16,185,129,0.7)',
                'rgba(239,68,68,0.7)',
                'rgba(251,191,36,0.7)'
              ],
              borderRadius: 6,
            },
          ],
        }}
        options={{
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            title: { display: true, text: title },
          },
          scales: {
            x: { beginAtZero: true },
          },
        }}
      />
    </div>
  );
}
