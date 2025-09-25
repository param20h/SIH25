import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const Dashboard = () => {
  const [riskStats, setRiskStats] = useState(null);
  const [priorityStudents, setPriorityStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, priorityResponse] = await Promise.all([
          api.getRiskStats(),
          api.getPriorityStudents(5)
        ]);
        
        setRiskStats(statsResponse);
        setPriorityStudents(priorityResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !riskStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Low Risk', value: riskStats.low_risk, color: '#10B981' },
    { name: 'Medium Risk', value: riskStats.medium_risk, color: '#F59E0B' },
    { name: 'High Risk', value: riskStats.high_risk, color: '#EF4444' }
  ];

  const departmentData = [
    { name: 'CSE', low: 15, medium: 8, high: 3 },
    { name: 'IT', low: 12, medium: 6, high: 2 },
    { name: 'CE', low: 18, medium: 4, high: 1 },
    { name: 'EEE', low: 14, medium: 5, high: 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{riskStats.total_students}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Risk</p>
              <p className="text-3xl font-bold text-green-600">{riskStats.low_risk}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medium Risk</p>
              <p className="text-3xl font-bold text-yellow-600">{riskStats.medium_risk}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-3xl font-bold text-red-600">{riskStats.high_risk}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Risk Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="low" stackId="a" fill="#10B981" name="Low Risk" />
              <Bar dataKey="medium" stackId="a" fill="#F59E0B" name="Medium Risk" />
              <Bar dataKey="high" stackId="a" fill="#EF4444" name="High Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Students */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Priority Students (Immediate Attention)</h3>
          <p className="text-sm text-gray-600">Students with highest urgency scores requiring intervention</p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {priorityStudents.map((student, index) => (
              <div key={student.Student_ID} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{student.Name}</div>
                    <div className="text-sm text-gray-500">{student.Department} • {student.Roll_No}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">Attendance</div>
                    <div className={student.Attendance_Percentage < 60 ? 'text-red-600' : 'text-gray-600'}>
                      {student.Attendance_Percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Avg Score</div>
                    <div className={student.Avg_Test_Score < 50 ? 'text-red-600' : 'text-gray-600'}>
                      {student.Avg_Test_Score.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Urgency</div>
                    <div className="text-red-600 font-bold">{student.urgency_score.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;