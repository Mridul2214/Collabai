import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics({ userId }) {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      // Fetch analytics data
      const res = await axios.get(`http://localhost:3000/api/analytics/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data && res.data.timeSpent !== undefined) {
        setData(res.data);
        
        // Fetch AI insights
        try {
          const insightsRes = await axios.get(`http://localhost:3000/api/analytics/${userId}/insights`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setInsights(insightsRes.data.insights);
        } catch (insightsError) {
          console.error("Error fetching insights:", insightsError);
          setInsights("AI insights not available at the moment.");
        }
      } else {
        setError("No analytics data available yet. Start using the app to generate data.");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p>No data available. Start using the app to generate analytics.</p>
      </div>
    );
  }

  // Prepare chart data
  const timeData = [
    { name: "Time Spent (min)", value: data.timeSpent || 0 }
  ];

  const todoData = [
    { name: "Completed", value: data.todos?.completed || 0 },
    { name: "Pending", value: data.todos?.pending || 0 }
  ];

  // Prepare AI search topics data
  const searchData = data.aiSearches?.slice(0, 5).map((search, index) => ({
    name: search.length > 20 ? search.substring(0, 20) + '...' : search,
    searches: 1,
    fullText: search
  })) || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 User Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Time Spent Card */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">⏱️ Time Spent on Platform</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center mt-2">{data.timeSpent || 0} minutes total</p>
        </div>

        {/* Todo Completion Card */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">✅ Todo Completion</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={todoData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {todoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center mt-2">
            {data.todos?.completed || 0} completed, {data.todos?.pending || 0} pending
          </p>
        </div>
      </div>

      {/* AI Searches Card */}
      {data.aiSearches && data.aiSearches.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">🔍 Recent AI Searches</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={searchData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    props.payload.fullText, 
                    "Search"
                  ]}
                />
                <Bar dataKey="searches" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Insights Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">🤖 AI-Powered Insights</h3>
        <div className="p-4 bg-blue-50 rounded-lg">
          {insights ? (
            <p className="text-gray-700">{insights}</p>
          ) : (
            <p className="text-gray-500">Generating insights... This may take a moment.</p>
          )}
        </div>
      </div>

      <button
        onClick={fetchData}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        🔄 Refresh Analytics
      </button>
    </div>
  );
}