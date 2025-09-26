import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertTriangle, CheckCircle, Calendar, MessageSquare, Target, Clock, Plus, CheckSquare } from 'lucide-react';
import { api } from '../services/api';

const Dashboard = ({ students = [] }) => {
  const [riskStats, setRiskStats] = useState(null);
  const [priorityStudents, setPriorityStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New state for additional features
  const [interventions, setInterventions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [progressTracking, setProgressTracking] = useState([]);
  const [showAddIntervention, setShowAddIntervention] = useState(false);
  const [showAddMeeting, setShowAddMeeting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // If we have students data from upload, use it to calculate stats
        if (students && students.length > 0) {
          const stats = calculateRiskStats(students);
          const priority = getPriorityStudents(students, 5);
          
          setRiskStats(stats);
          setPriorityStudents(priority);
          
          // Initialize sample data for new features
          initializeSampleData(students);
        } else {
          // Don't fetch from API by default - show empty state instead
          setRiskStats({
            total_students: 0,
            low_risk: 0,
            medium_risk: 0,
            high_risk: 0
          });
          setPriorityStudents([]);
          
          // Initialize empty data for new features
          setInterventions([]);
          setMeetings([]);
          setProgressTracking([]);
        }
      } catch (error) {
        console.error('Error processing dashboard data:', error);
        // Fallback to empty state
        setRiskStats({
          total_students: 0,
          low_risk: 0,
          medium_risk: 0,
          high_risk: 0
        });
        setPriorityStudents([]);
        setInterventions([]);
        setMeetings([]);
        setProgressTracking([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [students]);

  // Calculate risk statistics from student data
  const calculateRiskStats = (studentData) => {
    const total = studentData.length;
    const low = studentData.filter(s => s.dropout_risk === 0).length;
    const medium = studentData.filter(s => s.dropout_risk === 1).length;
    const high = studentData.filter(s => s.dropout_risk === 2).length;
    
    return {
      total_students: total,
      low_risk: low,
      medium_risk: medium,
      high_risk: high
    };
  };

  // Get priority students (high risk first)
  const getPriorityStudents = (studentData, limit) => {
    return studentData
      .filter(s => s.dropout_risk > 0)
      .sort((a, b) => b.dropout_risk - a.dropout_risk)
      .slice(0, limit);
  };

  // Initialize sample data for interventions, meetings, and progress tracking
  const initializeSampleData = (studentData) => {
    const highRiskStudents = studentData.filter(s => s.dropout_risk === 2);
    const mediumRiskStudents = studentData.filter(s => s.dropout_risk === 1);
    
    // Sample interventions
    const sampleInterventions = [
      {
        id: 1,
        studentId: highRiskStudents[0]?.Student_ID || 'STU001',
        studentName: highRiskStudents[0]?.Name || 'John Doe',
        type: 'Academic Support',
        status: 'Active',
        description: 'Weekly tutoring sessions for Mathematics',
        startDate: '2025-09-15',
        lastUpdate: '2025-09-25',
        progress: 'Showing improvement in test scores'
      },
      {
        id: 2,
        studentId: mediumRiskStudents[0]?.Student_ID || 'STU002',
        studentName: mediumRiskStudents[0]?.Name || 'Jane Smith',
        type: 'Attendance Counseling',
        status: 'Pending',
        description: 'Address attendance issues and family support',
        startDate: '2025-09-20',
        lastUpdate: '2025-09-24',
        progress: 'Initial meeting scheduled'
      }
    ];

    // Sample meetings
    const sampleMeetings = [
      {
        id: 1,
        studentId: highRiskStudents[0]?.Student_ID || 'STU001',
        studentName: highRiskStudents[0]?.Name || 'John Doe',
        type: 'Parent-Teacher Meeting',
        scheduledDate: '2025-09-28',
        time: '10:00 AM',
        status: 'Scheduled',
        purpose: 'Discuss academic progress and intervention plan',
        attendees: ['Student', 'Parent', 'Academic Counselor']
      },
      {
        id: 2,
        studentId: mediumRiskStudents[0]?.Student_ID || 'STU002',
        studentName: mediumRiskStudents[0]?.Name || 'Jane Smith',
        type: 'Counseling Session',
        scheduledDate: '2025-09-30',
        time: '2:00 PM',
        status: 'Scheduled',
        purpose: 'Personal counseling and motivation',
        attendees: ['Student', 'Counselor']
      }
    ];

    // Sample progress tracking
    const sampleProgress = studentData.slice(0, 5).map((student, index) => ({
      id: index + 1,
      studentId: student.Student_ID,
      studentName: student.Name,
      currentRisk: student.dropout_risk,
      previousRisk: Math.min(student.dropout_risk + 1, 2),
      trend: student.dropout_risk < 2 ? 'improving' : 'stable',
      lastAssessment: '2025-09-25',
      keyMetrics: {
        attendance: student.Attendance_Percentage || 0,
        academicScore: student.Avg_Test_Score || 0,
        engagementScore: Math.floor(Math.random() * 100),
        interventionResponse: Math.floor(Math.random() * 100)
      },
      notes: `Recent ${student.dropout_risk < 1 ? 'improvement' : 'monitoring'} in academic performance`
    }));

    setInterventions(sampleInterventions);
    setMeetings(sampleMeetings);
    setProgressTracking(sampleProgress);
  };

  if (loading) {
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

  // Provide default values if riskStats is null/undefined
  const safeRiskStats = riskStats || {
    total_students: 0,
    low_risk: 0,
    medium_risk: 0,
    high_risk: 0
  };

  const pieData = [
    { name: 'Low Risk', value: safeRiskStats.low_risk, color: '#10B981' },
    { name: 'Medium Risk', value: safeRiskStats.medium_risk, color: '#F59E0B' },
    { name: 'High Risk', value: safeRiskStats.high_risk, color: '#EF4444' }
  ];

  // Calculate department-wise data from actual student data
  const getDepartmentData = () => {
    if (!students || students.length === 0) {
      // Default data if no students available
      return [
        { name: 'CSE', low: 15, medium: 8, high: 3 },
        { name: 'IT', low: 12, medium: 6, high: 2 },
        { name: 'CE', low: 18, medium: 4, high: 1 },
        { name: 'EEE', low: 14, medium: 5, high: 2 }
      ];
    }

    const departmentStats = {};
    students.forEach(student => {
      const dept = student.Department || 'Unknown';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { name: dept, low: 0, medium: 0, high: 0 };
      }
      
      if (student.dropout_risk === 0) departmentStats[dept].low++;
      else if (student.dropout_risk === 1) departmentStats[dept].medium++;
      else if (student.dropout_risk === 2) departmentStats[dept].high++;
    });

    return Object.values(departmentStats).sort((a, b) => a.name.localeCompare(b.name));
  };

  const departmentData = getDepartmentData();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Students</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{safeRiskStats.total_students}</p>
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
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{safeRiskStats.low_risk}</p>
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
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">{safeRiskStats.medium_risk}</p>
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
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{safeRiskStats.high_risk}</p>
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
            {(priorityStudents || []).map((student, index) => (
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
                      {(student.Attendance_Percentage || 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center flex-1 sm:flex-none">
                    <div className="font-medium text-xs sm:text-sm">Avg Score</div>
                    <div className={student.Avg_Test_Score < 50 ? 'text-red-600' : 'text-gray-600'}>
                      {(student.Avg_Test_Score || 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center flex-1 sm:flex-none">
                    <div className="font-medium text-xs sm:text-sm">Urgency</div>
                    <div className="text-red-600 font-bold">{(student.urgency_score || 0).toFixed(1)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interventions Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Active Interventions
            </h3>
            <p className="text-sm text-gray-600 hidden sm:block">Ongoing support programs for at-risk students</p>
          </div>
          <button
            onClick={() => setShowAddIntervention(!showAddIntervention)}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Intervention
          </button>
        </div>
        <div className="p-4 sm:p-6">
          {interventions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No active interventions. Click "Add Intervention" to create one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interventions.map((intervention) => (
                <div key={intervention.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{intervention.studentName}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          intervention.status === 'Active' ? 'bg-green-100 text-green-700' :
                          intervention.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {intervention.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{intervention.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Type: {intervention.type}</span>
                        <span>Started: {new Date(intervention.startDate).toLocaleDateString()}</span>
                        <span>Updated: {new Date(intervention.lastUpdate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-sm text-gray-600 mb-1">Progress:</p>
                      <p className="text-sm font-medium text-blue-600">{intervention.progress}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meetings Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Upcoming Meetings
            </h3>
            <p className="text-sm text-gray-600 hidden sm:block">Scheduled counseling sessions and parent meetings</p>
          </div>
          <button
            onClick={() => setShowAddMeeting(!showAddMeeting)}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>
        <div className="p-4 sm:p-6">
          {meetings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No scheduled meetings. Click "Schedule Meeting" to create one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{meeting.studentName}</h4>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          {meeting.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{meeting.purpose}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(meeting.scheduledDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meeting.time}
                        </span>
                        <span>Attendees: {meeting.attendees.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        meeting.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                        meeting.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Tracking Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Progress Tracking
          </h3>
          <p className="text-sm text-gray-600 hidden sm:block">Monitor student improvement over time</p>
        </div>
        <div className="p-4 sm:p-6">
          {progressTracking.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No progress data available. Upload student data to start tracking.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progressTracking.map((progress) => (
                <div key={progress.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-medium text-gray-900">{progress.studentName}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${
                            progress.trend === 'improving' ? 'bg-green-500' :
                            progress.trend === 'declining' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></span>
                          <span className="text-sm text-gray-600 capitalize">{progress.trend}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Attendance</div>
                          <div className={`font-medium ${progress.keyMetrics.attendance < 70 ? 'text-red-600' : 'text-green-600'}`}>
                            {progress.keyMetrics.attendance.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Academic</div>
                          <div className={`font-medium ${progress.keyMetrics.academicScore < 60 ? 'text-red-600' : 'text-green-600'}`}>
                            {progress.keyMetrics.academicScore.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Engagement</div>
                          <div className={`font-medium ${progress.keyMetrics.engagementScore < 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {progress.keyMetrics.engagementScore}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Response</div>
                          <div className={`font-medium ${progress.keyMetrics.interventionResponse < 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {progress.keyMetrics.interventionResponse}%
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">{progress.notes}</p>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Risk Level</div>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            progress.previousRisk === 0 ? 'bg-green-500' :
                            progress.previousRisk === 1 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {progress.previousRisk}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            progress.currentRisk === 0 ? 'bg-green-500' :
                            progress.currentRisk === 1 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {progress.currentRisk}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(progress.lastAssessment).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;