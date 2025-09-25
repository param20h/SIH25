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
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <div className="animate-pulse">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Students</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{riskStats.total_students}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Low Risk</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{riskStats.low_risk}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Medium Risk</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">{riskStats.medium_risk}</p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">High Risk</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{riskStats.high_risk}</p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
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
        </div>

        {/* Department Risk Analysis */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk by Department</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
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
      </div>

      {/* Priority Students */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Priority Students</h3>
          <p className="text-sm text-gray-600 hidden sm:block">Students with highest urgency scores requiring intervention</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            {priorityStudents.map((student, index) => (
              <div key={student.Student_ID} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">{student.Name}</div>
                    <div className="text-sm text-gray-500 truncate">{student.Department} • {student.Roll_No}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:space-x-6 text-sm">
                  <div className="text-center flex-1 sm:flex-none">
                    <div className="font-medium text-xs sm:text-sm">Attendance</div>
                    <div className={student.Attendance_Percentage < 60 ? 'text-red-600' : 'text-gray-600'}>
                      {student.Attendance_Percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center flex-1 sm:flex-none">
                    <div className="font-medium text-xs sm:text-sm">Avg Score</div>
                    <div className={student.Avg_Test_Score < 50 ? 'text-red-600' : 'text-gray-600'}>
                      {student.Avg_Test_Score.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center flex-1 sm:flex-none">
                    <div className="font-medium text-xs sm:text-sm">Urgency</div>
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