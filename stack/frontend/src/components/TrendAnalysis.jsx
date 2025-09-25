import React, { useState, useMemo } from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, Calendar, BarChart3, Users, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const TrendAnalysis = ({ students = [] }) => {
  const [timeRange, setTimeRange] = useState('4weeks'); // 4weeks, 8weeks, semester
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [analysisType, setAnalysisType] = useState('attendance'); // attendance, performance, combined

  // Calculate trends and patterns
  const trendData = useMemo(() => {
    // Generate mock historical data for demonstration
    const weeks = timeRange === '4weeks' ? 4 : timeRange === '8weeks' ? 8 : 16;
    const data = [];
    
    for (let i = weeks; i >= 0; i--) {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - (i * 7));
      
      // Calculate weekly averages
      const weekStudents = students.filter(s => 
        selectedDepartment === 'all' || s.department === selectedDepartment
      );
      
      const avgAttendance = weekStudents.length > 0 
        ? weekStudents.reduce((sum, s) => sum + (s.attendance || 0), 0) / weekStudents.length
        : 0;
        
      const avgPerformance = weekStudents.length > 0
        ? weekStudents.reduce((sum, s) => sum + (s.avgTestScore || 0), 0) / weekStudents.length
        : 0;

      // Add some trend simulation
      const trendFactor = Math.max(0.7, 1 - (i * 0.02)); // Gradual decline simulation
      const randomFactor = 0.95 + (Math.random() * 0.1); // Small random variation
      
      data.push({
        week: `Week ${weeks - i}`,
        date: weekDate.toISOString().split('T')[0],
        attendance: Math.round(avgAttendance * trendFactor * randomFactor),
        performance: Math.round(avgPerformance * trendFactor * randomFactor),
        studentsAtRisk: Math.round(weekStudents.filter(s => s.dropout_risk >= 2).length * (1 + i * 0.1))
      });
    }
    
    return data;
  }, [students, timeRange, selectedDepartment]);

  // Identify concerning patterns
  const patterns = useMemo(() => {
    const detected = [];
    
    // Declining attendance pattern
    const recentAttendance = trendData.slice(-3).map(d => d.attendance);
    if (recentAttendance.length >= 3) {
      const isDecline = recentAttendance[0] > recentAttendance[1] && recentAttendance[1] > recentAttendance[2];
      if (isDecline && recentAttendance[2] < 80) {
        detected.push({
          type: 'attendance_decline',
          severity: 'high',
          message: `Attendance declining for 3 consecutive weeks. Current: ${recentAttendance[2]}%`,
          recommendation: 'Immediate intervention required. Contact mentors and parents.',
          affectedStudents: students.filter(s => s.attendance < 80).length
        });
      }
    }

    // Performance drop pattern
    const recentPerformance = trendData.slice(-2).map(d => d.performance);
    if (recentPerformance.length >= 2) {
      const dropPercent = ((recentPerformance[0] - recentPerformance[1]) / recentPerformance[0]) * 100;
      if (dropPercent > 10) {
        detected.push({
          type: 'performance_drop',
          severity: 'medium',
          message: `Performance dropped by ${dropPercent.toFixed(1)}% in recent weeks`,
          recommendation: 'Review curriculum difficulty and provide additional support sessions.',
          affectedStudents: students.filter(s => s.avgTestScore < 65).length
        });
      }
    }

    // Seasonal pattern detection
    const currentMonth = new Date().getMonth();
    if ([10, 11, 0].includes(currentMonth)) { // Nov, Dec, Jan - exam season
      detected.push({
        type: 'seasonal_stress',
        severity: 'medium',
        message: 'Exam season typically shows increased dropout risk',
        recommendation: 'Increase counseling sessions and stress management workshops.',
        affectedStudents: students.filter(s => s.dropout_risk >= 1).length
      });
    }

    // Weekend effect (if students have Saturday classes)
    const weekendAttendance = students.reduce((sum, s) => sum + (s.weekendAttendance || s.attendance), 0) / students.length;
    if (weekendAttendance < (students.reduce((sum, s) => sum + s.attendance, 0) / students.length) - 10) {
      detected.push({
        type: 'weekend_effect',
        severity: 'low',
        message: 'Weekend classes show significantly lower attendance',
        recommendation: 'Consider rescheduling important topics to weekdays or making weekend sessions more engaging.',
        affectedStudents: Math.round(students.length * 0.3)
      });
    }

    return detected;
  }, [trendData, students]);

  // Early warning predictions
  const predictions = useMemo(() => {
    const predictions = [];
    
    students.forEach(student => {
      const riskFactors = [];
      let predictedRisk = 0;

      // Attendance trend prediction
      if (student.attendance < 85 && student.attendanceTrend < -2) {
        riskFactors.push('Declining attendance trend');
        predictedRisk += 0.3;
      }

      // Performance trend
      if (student.avgTestScore < 70 && (student.lastTestScore - student.avgTestScore) < -5) {
        riskFactors.push('Declining academic performance');
        predictedRisk += 0.25;
      }

      // Financial stress indicator
      if (student.feeDueDays > 15) {
        riskFactors.push('Financial difficulties');
        predictedRisk += 0.2;
      }

      // Behavioral indicators (simulated)
      const behavioralRisk = Math.random() * 0.25; // Simulate behavioral analysis
      if (behavioralRisk > 0.15) {
        riskFactors.push('Behavioral pattern changes');
        predictedRisk += behavioralRisk;
      }

      if (predictedRisk > 0.5 && riskFactors.length > 0) {
        predictions.push({
          studentId: student.id,
          studentName: student.name,
          department: student.department,
          currentRisk: student.dropout_risk,
          predictedRisk: Math.min(predictedRisk, 1),
          timeframe: predictedRisk > 0.8 ? '2-3 weeks' : '4-6 weeks',
          riskFactors,
          confidence: Math.round((predictedRisk * 100) - 10 + (Math.random() * 20))
        });
      }
    });

    return predictions.sort((a, b) => b.predictedRisk - a.predictedRisk);
  }, [students]);

  const departments = [...new Set(students.map(s => s.department))];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Trend Analysis & Early Warning</h2>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Predictive analytics and pattern detection</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="4weeks">Last 4 Weeks</option>
              <option value="8weeks">Last 8 Weeks</option>
              <option value="semester">Full Semester</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Type</label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="attendance">Attendance Trends</option>
              <option value="performance">Performance Trends</option>
              <option value="combined">Combined Analysis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance/Performance Trend */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            {analysisType === 'attendance' ? 'Attendance' : analysisType === 'performance' ? 'Performance' : 'Combined'} Trends
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                {(analysisType === 'attendance' || analysisType === 'combined') && (
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Attendance (%)"
                  />
                )}
                {(analysisType === 'performance' || analysisType === 'combined') && (
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Performance (%)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Students at Risk Over Time</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="studentsAtRisk" fill="#ef4444" name="High Risk Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pattern Detection */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Detected Patterns</h3>
        </div>
        
        {patterns.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-green-500" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No concerning patterns detected</h4>
            <p className="mt-1 text-sm text-gray-500">All trends appear stable</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded-r-lg ${
                  pattern.severity === 'high' ? 'border-red-500 bg-red-50' :
                  pattern.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pattern.severity === 'high' ? 'bg-red-100 text-red-800' :
                        pattern.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {pattern.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {pattern.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{pattern.message}</p>
                    <p className="text-sm text-gray-600 mb-2">{pattern.recommendation}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {pattern.affectedStudents} students affected
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-white border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Early Warning Predictions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingDown className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Early Warning Predictions</h3>
          <span className="text-xs text-gray-500">AI-powered risk prediction</span>
        </div>
        
        {predictions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-green-500" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No immediate risks predicted</h4>
            <p className="mt-1 text-sm text-gray-500">Continue monitoring for early warning signs</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeframe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Factors</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {predictions.slice(0, 10).map((prediction) => (
                  <tr key={prediction.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {prediction.studentName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {prediction.department}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className={`w-16 h-2 rounded-full mr-2 ${
                          prediction.predictedRisk > 0.8 ? 'bg-red-200' :
                          prediction.predictedRisk > 0.6 ? 'bg-yellow-200' :
                          'bg-blue-200'
                        }`}>
                          <div
                            className={`h-2 rounded-full ${
                              prediction.predictedRisk > 0.8 ? 'bg-red-600' :
                              prediction.predictedRisk > 0.6 ? 'bg-yellow-600' :
                              'bg-blue-600'
                            }`}
                            style={{ width: `${prediction.predictedRisk * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {Math.round(prediction.predictedRisk * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {prediction.timeframe}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {prediction.riskFactors.slice(0, 2).map((factor, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {factor}
                          </span>
                        ))}
                        {prediction.riskFactors.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{prediction.riskFactors.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {prediction.confidence}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendAnalysis;