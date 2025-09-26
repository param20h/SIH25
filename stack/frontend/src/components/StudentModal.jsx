import React from 'react';
import { X, AlertTriangle, CheckCircle, Clock, User, GraduationCap, Calendar, DollarSign } from 'lucide-react';
import RiskBadge from './RiskBadge';

const StudentModal = ({ student, prediction, onClose }) => {
  if (!student || !prediction) return null;

  // Safely access prediction data with fallbacks
  const safePrediction = {
    prediction: {
      risk_level: prediction.prediction?.risk_level || (student.dropout_risk === 2 ? 'High Risk' : student.dropout_risk === 1 ? 'Medium Risk' : 'Low Risk'),
      risk_score: prediction.prediction?.risk_score ?? student.dropout_risk ?? 0,
      confidence: prediction.prediction?.confidence ?? 0.85,
      probabilities: prediction.prediction?.probabilities || {
        low_risk: 0.33,
        medium_risk: 0.33,
        high_risk: 0.33
      }
    },
    recommendations: prediction.recommendations || [],
    explanation: prediction.explanation || { main_factors: [] },
    key_stats: prediction.key_stats || {}
  };

  // Safely access student data with fallbacks
  const safeStudent = {
    ...student,
    Attendance_Percentage: student.Attendance_Percentage ?? 0,
    Avg_Test_Score: student.Avg_Test_Score ?? 0,
    Subjects_Failed: student.Subjects_Failed ?? 0,
    Fee_Due_Days: student.Fee_Due_Days ?? 0,
    Total_Risk_Flags: student.Total_Risk_Flags ?? 0
  };

  const getRiskColor = (riskScore) => {
    switch (riskScore) {
      case 0: return 'text-green-600';
      case 1: return 'text-yellow-600';
      case 2: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{student.Name}</h2>
            <p className="text-sm sm:text-base text-gray-600 truncate">{student.Roll_No} • {student.Department} • Semester {student.Semester}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Prediction Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              Risk Assessment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="mb-2">
                  <RiskBadge riskLevel={safePrediction.prediction.risk_level} riskScore={safePrediction.prediction.risk_score} />
                </div>
                <p className="text-sm text-gray-600">Current Risk Level</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRiskColor(safePrediction.prediction.risk_score)} mb-1`}>
                  {(safePrediction.prediction.confidence * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Prediction Confidence</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {safeStudent.Total_Risk_Flags}
                </div>
                <p className="text-sm text-gray-600">Active Risk Flags</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              Academic Metrics
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
                <div className={`text-lg sm:text-xl font-bold mb-1 ${safeStudent.Attendance_Percentage < 75 ? 'text-red-600' : 'text-gray-900'}`}>
                  {safeStudent.Attendance_Percentage.toFixed(1)}%
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Attendance</p>
                {safeStudent.Attendance_Percentage < 75 && (
                  <div className="mt-1 text-xs text-red-600">Below threshold</div>
                )}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
                <div className={`text-lg sm:text-xl font-bold mb-1 ${safeStudent.Avg_Test_Score < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                  {safeStudent.Avg_Test_Score.toFixed(1)}%
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Average Score</p>
                {safeStudent.Avg_Test_Score < 60 && (
                  <div className="mt-1 text-xs text-red-600">Needs improvement</div>
                )}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
                <div className={`text-lg sm:text-xl font-bold mb-1 ${safeStudent.Subjects_Failed > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {safeStudent.Subjects_Failed}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Failed Subjects</p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
                <div className={`text-lg sm:text-xl font-bold mb-1 ${safeStudent.Fee_Due_Days > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {safeStudent.Fee_Due_Days}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Fee Due Days</p>
                {safeStudent.Fee_Due_Days > 30 && (
                  <div className="mt-1 text-xs text-red-600">Overdue</div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Probabilities */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Risk Probability Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  Low Risk
                </span>
                <div className="flex-1 mx-2 sm:mx-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{width: `${(safePrediction.prediction.probabilities.low_risk * 100)}%`}}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm font-medium">{(safePrediction.prediction.probabilities.low_risk * 100).toFixed(1)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm sm:text-base">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                  Medium Risk
                </span>
                <div className="flex-1 mx-2 sm:mx-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{width: `${(safePrediction.prediction.probabilities.medium_risk * 100)}%`}}
                  ></div>
                </div>
                <span className="text-xs sm:text-sm font-medium">{(safePrediction.prediction.probabilities.medium_risk * 100).toFixed(1)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm sm:text-base">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                  High Risk
                </span>
                <div className="flex-1 mx-2 sm:mx-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{width: `${(safePrediction.prediction.probabilities.high_risk * 100)}%`}}
                  ></div>
                </div>
                <span className="text-sm font-medium">{(safePrediction.prediction.probabilities.high_risk * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Risk Explanation */}
          {safePrediction.explanation && safePrediction.explanation.main_factors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors Identified</h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {safePrediction.explanation.main_factors.map((factor, index) => (
                    <li key={index} className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="w-4 h-4" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {safePrediction.recommendations && safePrediction.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recommended Actions
              </h3>
              <div className="space-y-4">
                {safePrediction.recommendations.map((rec, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm uppercase tracking-wide">
                        {rec.category} • {rec.priority} Priority
                      </div>
                      <div className="text-xs opacity-75">{rec.timeline}</div>
                    </div>
                    <div className="font-semibold text-base mb-1">{rec.action}</div>
                    <div className="text-sm opacity-90">{rec.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Student Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Mentor ID:</span>
                  <span className="ml-2">{safeStudent.Mentor_ID || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Department:</span>
                  <span className="ml-2">{safeStudent.Department}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Current Semester:</span>
                  <span className="ml-2">{safeStudent.Semester || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Risk Flags:</span>
                  <span className="ml-2">{safeStudent.Total_Risk_Flags}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Send to Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentModal;