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
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Student Risk Assessment</h3>
        <p className="text-sm text-gray-600 hidden sm:block">Monitor and take action on at-risk students</p>
      </div>
      
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {students.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-gray-400 mb-2">No students found</div>
            <div className="text-sm">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {students.map((student) => (
              <div key={student.Student_ID} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {student.Name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.Roll_No} • {student.Department}
                    </p>
                  </div>
                  <RiskBadge risk={student.dropout_risk} />
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Attendance:</span>
                    <span className={`ml-1 font-medium ${
                      student.Attendance_Percentage < 75 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {student.Attendance_Percentage?.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Score:</span>
                    <span className={`ml-1 font-medium ${
                      student.Avg_Test_Score < 60 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {student.Avg_Test_Score?.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Failed:</span>
                    <span className={`ml-1 font-medium ${
                      student.Subjects_Failed > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {student.Subjects_Failed || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fee Due:</span>
                    <span className={`ml-1 font-medium ${
                      student.Fee_Due_Days > 30 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {student.Fee_Due_Days || 0}d
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => onStudentSelect(student)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Details
                  </button>
                  
                  {student.dropout_risk > 0 && (
                    <button
                      onClick={() => handleNotify(student.Student_ID, student.Name)}
                      disabled={notifying[student.Student_ID]}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                    >
                      <Bell className="w-3 h-3" />
                      {notifying[student.Student_ID] ? 'Sending...' : 'Alert'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
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
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onStudentSelect(student)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden lg:inline">Details</span>
                    </button>
                    
                    {student.dropout_risk > 0 && (
                      <button
                        onClick={() => handleNotify(student.Student_ID, student.Name)}
                        disabled={notifying[student.Student_ID]}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors disabled:opacity-50"
                        title="Send Alert"
                      >
                        <Bell className="w-4 h-4" />
                        <span className="hidden lg:inline">
                          {notifying[student.Student_ID] ? 'Sending...' : 'Alert'}
                        </span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {students.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No students found</div>
            <div className="text-gray-500 text-sm">Try adjusting your filters</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTable;