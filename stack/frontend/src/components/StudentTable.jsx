import React, { useState } from 'react';
import { Bell, Eye, Mail, Phone } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { api } from '../services/api';

const StudentTable = ({ students, onStudentSelect, loading }) => {
  const [notifying, setNotifying] = useState({});

  const handleNotify = async (studentId, studentName) => {
    setNotifying(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const response = await api.sendNotification(
        studentId, 
        `Urgent: Please contact your mentor regarding your academic progress.`
      );
      
      alert(`✅ Notification sent to ${studentName} and parents successfully!`);
    } catch (error) {
      alert(`❌ Failed to send notification: ${error.message}`);
    } finally {
      setNotifying(prev => ({ ...prev, [studentId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Student Risk Assessment</h3>
        <p className="text-sm text-gray-600">Monitor and take action on at-risk students</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Failed Subjects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.Student_ID} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {student.Name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.Roll_No} • Sem {student.Semester}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {student.Department}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {student.Attendance_Percentage.toFixed(1)}%
                    </div>
                    {student.Attendance_Percentage < 75 && (
                      <div className="ml-2 w-2 h-2 bg-red-400 rounded-full"></div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {student.Avg_Test_Score.toFixed(1)}%
                    </div>
                    {student.Avg_Test_Score < 50 && (
                      <div className="ml-2 w-2 h-2 bg-red-400 rounded-full"></div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    student.Subjects_Failed > 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {student.Subjects_Failed}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <RiskBadge 
                    riskLevel={['Low Risk', 'Medium Risk', 'High Risk'][student.dropout_risk]} 
                    riskScore={student.dropout_risk} 
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onStudentSelect(student)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                  
                  <button
                    onClick={() => handleNotify(student.Student_ID, student.Name)}
                    disabled={notifying[student.Student_ID]}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send Alert"
                  >
                    <Bell className="w-4 h-4" />
                    {notifying[student.Student_ID] ? 'Sending...' : 'Alert'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {students.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No students found</div>
          <div className="text-gray-500 text-sm">Try adjusting your filters</div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;