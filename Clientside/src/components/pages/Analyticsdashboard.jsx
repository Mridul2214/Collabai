import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const UserAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token') || '';

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const token = getToken();
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type");
        const responseText = await response.text();

        if (response.ok && contentType?.includes("application/json")) {
          const data = JSON.parse(responseText);

          // Normalize the data (ensure all fields exist)
          setAnalyticsData({
            siteVisits: data.siteVisits || { labels: [], data: [] },
            aiBotUsage: data.aiBotUsage || { labels: [], data: [] },
            todoStatus: data.todoStatus || { completed: 0, inProgress: 0, notStarted: 0 },
            whiteboardUsage: data.whiteboardUsage || { labels: [], data: [] },
          });
        } else {
          console.error('Failed to fetch analytics data', response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // Chart options
  const barOptions = { responsive: true, plugins: { legend: { position: 'top' } } };
  const lineOptions = { responsive: true, plugins: { legend: { position: 'top' } } };
  const doughnutOptions = { responsive: true, plugins: { legend: { position: 'top' } } };

  if (!analyticsData) {
    return <div>Loading analytics data...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>User Analytics Dashboard</h1>

      {/* Time range selector */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="timeRange">Time Range: </label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ padding: '5px', borderRadius: '4px' }}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
        </select>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Site Visits */}
        <ChartCard title="Site Visits">
          <Bar
            options={barOptions}
            data={{
              labels: analyticsData.siteVisits.labels,
              datasets: [
                { label: 'Number of Visits', data: analyticsData.siteVisits.data, backgroundColor: 'rgba(53, 162, 235, 0.5)' },
              ],
            }}
          />
        </ChartCard>

        {/* AI Bot Usage */}
        <ChartCard title="AI Bot Usage">
          <Line
            options={lineOptions}
            data={{
              labels: analyticsData.aiBotUsage.labels,
              datasets: [
                { label: 'Number of Interactions', data: analyticsData.aiBotUsage.data, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)' },
              ],
            }}
          />
        </ChartCard>

        {/* To-Do Status */}
        <ChartCard title="To-Do Item Status">
          <Doughnut
            options={doughnutOptions}
            data={{
              labels: ['Completed', 'In Progress', 'Not Started'],
              datasets: [
                {
                  data: [
                    analyticsData.todoStatus.completed,
                    analyticsData.todoStatus.inProgress,
                    analyticsData.todoStatus.notStarted,
                  ],
                  backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(255, 99, 132, 0.5)'],
                  borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </ChartCard>

        {/* Whiteboard Usage */}
        <ChartCard title="Whiteboard Usage">
          <Bar
            options={barOptions}
            data={{
              labels: analyticsData.whiteboardUsage.labels,
              datasets: [
                { label: 'Number of Sessions', data: analyticsData.whiteboardUsage.data, backgroundColor: 'rgba(153, 102, 255, 0.5)' },
              ],
            }}
          />
        </ChartCard>
      </div>

      {/* Summary Stats */}
      <SummaryCard analyticsData={analyticsData} />
    </div>
  );
};

// Small helper components
const ChartCard = ({ title, children }) => (
  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
    <h2>{title}</h2>
    {children}
  </div>
);

const SummaryCard = ({ analyticsData }) => {
  const totalTodos =
    analyticsData.todoStatus.completed +
    analyticsData.todoStatus.inProgress +
    analyticsData.todoStatus.notStarted;

  const completionRate = totalTodos > 0 ? Math.round((analyticsData.todoStatus.completed / totalTodos) * 100) : 0;

  return (
    <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2>Summary Statistics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        <Stat title="Total Site Visits" value={analyticsData.siteVisits.data.reduce((a, b) => a + b, 0)} />
        <Stat title="AI Bot Interactions" value={analyticsData.aiBotUsage.data.reduce((a, b) => a + b, 0)} />
        <Stat title="To-Do Completion Rate" value={`${completionRate}%`} />
        <Stat title="Whiteboard Sessions" value={analyticsData.whiteboardUsage.data.reduce((a, b) => a + b, 0)} />
      </div>
    </div>
  );
};

const Stat = ({ title, value }) => (
  <div style={{ textAlign: 'center' }}>
    <h3>{title}</h3>
    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</p>
  </div>
);

export default UserAnalyticsDashboard;
