// API Service - Integrated with ML Backend
import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const USE_ML_BACKEND = process.env.REACT_APP_USE_ML_BACKEND === 'true' || false;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data fallback (same as before but smaller subset for development)
const mockStudents = [
  {
    Student_ID: 'S00001',
    Name: 'Ankita Mishra',
    Roll_No: 'R000001',
    Department: 'CE',
    Semester: 1,
    Mentor_ID: 'M084',
    Attendance_Percentage: 72.2,
    Avg_Test_Score: 59.0,
    Subjects_Failed: 0,
    Fee_Due_Days: 0,
    Total_Risk_Flags: 0,
    dropout_risk: 0
  },
  {
    Student_ID: 'S00003',
    Name: 'Siddharth Banerjee',
    Roll_No: 'R000003',
    Department: 'CE',
    Semester: 5,
    Mentor_ID: 'M081',
    Attendance_Percentage: 75.6,
    Avg_Test_Score: 64.8,
    Subjects_Failed: 0,
    Fee_Due_Days: 96,
    Total_Risk_Flags: 1,
    dropout_risk: 1
  },
  {
    Student_ID: 'S00007',
    Name: 'Yash Chopra',
    Roll_No: 'R000007',
    Department: 'IT',
    Semester: 4,
    Mentor_ID: 'M070',
    Attendance_Percentage: 45.1,
    Avg_Test_Score: 35.2,
    Subjects_Failed: 2,
    Fee_Due_Days: 43,
    Total_Risk_Flags: 3,
    dropout_risk: 2
  },
  {
    Student_ID: 'S00010',
    Name: 'Priya Sharma',
    Roll_No: 'R000010',
    Department: 'CSE',
    Semester: 6,
    Mentor_ID: 'M055',
    Attendance_Percentage: 55.3,
    Avg_Test_Score: 42.1,
    Subjects_Failed: 1,
    Fee_Due_Days: 25,
    Total_Risk_Flags: 2,
    dropout_risk: 2
  },
  {
    Student_ID: 'S00015',
    Name: 'Rahul Kumar',
    Roll_No: 'R000015',
    Department: 'EEE',
    Semester: 3,
    Mentor_ID: 'M042',
    Attendance_Percentage: 88.7,
    Avg_Test_Score: 78.5,
    Subjects_Failed: 0,
    Fee_Due_Days: 0,
    Total_Risk_Flags: 0,
    dropout_risk: 0
  },
  {
    Student_ID: 'S00020',
    Name: 'Neha Patel',
    Roll_No: 'R000020',
    Department: 'IT',
    Semester: 7,
    Mentor_ID: 'M088',
    Attendance_Percentage: 42.8,
    Avg_Test_Score: 28.3,
    Subjects_Failed: 3,
    Fee_Due_Days: 120,
    Total_Risk_Flags: 4,
    dropout_risk: 2
  }
];

// Helper function to check backend availability
const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data.ml_available;
  } catch (error) {
    console.warn('Backend not available, using mock data');
    return false;
  }
};

export const api = {
  // Get all students
  async getStudents(filters = {}) {
    if (USE_ML_BACKEND) {
      try {
        const params = new URLSearchParams();
        if (filters.department) params.append('department', filters.department);
        if (filters.risk_level !== undefined) params.append('risk_level', filters.risk_level);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await apiClient.get(`/students?${params}`);
        return {
          data: response.data.data,
          total: response.data.total,
          source: 'ml_backend'
        };
      } catch (error) {
        console.warn('ML backend failed, falling back to mock data:', error.message);
        return {
          data: mockStudents,
          total: mockStudents.length,
          source: 'mock_fallback'
        };
      }
    }
    
    // Mock data with client-side filtering
    let filtered = [...mockStudents];
    
    if (filters.department) {
      filtered = filtered.filter(s => s.Department === filters.department);
    }
    
    if (filters.risk_level !== undefined) {
      filtered = filtered.filter(s => s.dropout_risk === parseInt(filters.risk_level));
    }
    
    return {
      data: filtered,
      total: filtered.length,
      source: 'mock'
    };
  },

  // Get single student prediction
  async predictStudent(studentId) {
    if (USE_ML_BACKEND) {
      try {
        const response = await apiClient.get(`/student/${studentId}/predict`);
        return response.data;
      } catch (error) {
        console.warn('ML prediction failed, using mock prediction:', error.message);
      }
    }
    
    // Mock prediction logic
    const student = mockStudents.find(s => s.Student_ID === studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const riskLabels = ['Low Risk', 'Medium Risk', 'High Risk'];
    const recommendations = [];

    // Generate mock recommendations
    if (student.Attendance_Percentage < 60) {
      recommendations.push({
        category: 'Attendance',
        priority: 'High',
        action: 'Schedule immediate mentor meeting',
        description: `Attendance at ${student.Attendance_Percentage}% - Critical intervention needed`
      });
    }

    if (student.Avg_Test_Score < 40) {
      recommendations.push({
        category: 'Academic',
        priority: 'High',
        action: 'Enroll in remedial classes',
        description: `Average score ${student.Avg_Test_Score}% - Needs intensive support`
      });
    }

    if (student.Fee_Due_Days > 60) {
      recommendations.push({
        category: 'Financial',
        priority: 'High',
        action: 'Urgent financial counseling required',
        description: `Fees overdue by ${student.Fee_Due_Days} days`
      });
    }

    return {
      student_id: studentId,
      student_name: student.Name,
      department: student.Department,
      prediction: {
        risk_level: riskLabels[student.dropout_risk],
        risk_score: student.dropout_risk,
        confidence: 0.85 + Math.random() * 0.1,
        probabilities: {
          low_risk: student.dropout_risk === 0 ? 0.8 : student.dropout_risk === 1 ? 0.3 : 0.1,
          medium_risk: student.dropout_risk === 1 ? 0.6 : 0.2,
          high_risk: student.dropout_risk === 2 ? 0.8 : student.dropout_risk === 1 ? 0.1 : 0.1
        }
      },
      recommendations,
      explanation: {
        main_factors: recommendations.map(r => r.description),
        explanation: `Student flagged as ${riskLabels[student.dropout_risk]} due to multiple risk factors`
      },
      key_stats: {
        attendance: student.Attendance_Percentage,
        avg_score: student.Avg_Test_Score,
        subjects_failed: student.Subjects_Failed,
        fee_due_days: student.Fee_Due_Days
      },
      source: USE_ML_BACKEND ? 'mock_fallback' : 'mock'
    };
  },

  // Get priority students
  async getPriorityStudents() {
    if (USE_ML_BACKEND) {
      try {
        const response = await apiClient.get('/priority-students');
        return response.data;
      } catch (error) {
        console.warn('Priority students API failed, using mock data:', error.message);
      }
    }
    
    // Mock priority students (high risk ones)
    const priorityStudents = mockStudents
      .filter(s => s.dropout_risk >= 2)
      .sort((a, b) => b.Total_Risk_Flags - a.Total_Risk_Flags)
      .slice(0, 5);
    
    return {
      priority_students: priorityStudents,
      count: priorityStudents.length,
      source: USE_ML_BACKEND ? 'mock_fallback' : 'mock'
    };
  },

  // Get dashboard analytics
  async getDashboardAnalytics() {
    if (USE_ML_BACKEND) {
      try {
        const response = await apiClient.get('/analytics/dashboard');
        return response.data;
      } catch (error) {
        console.warn('Analytics API failed, using mock data:', error.message);
      }
    }
    
    // Mock analytics
    const totalStudents = mockStudents.length;
    const deptCounts = mockStudents.reduce((acc, student) => {
      acc[student.Department] = (acc[student.Department] || 0) + 1;
      return acc;
    }, {});
    
    const riskDistribution = mockStudents.reduce((acc, student) => {
      if (student.dropout_risk === 0) acc.low_risk++;
      else if (student.dropout_risk === 1) acc.medium_risk++;
      else acc.high_risk++;
      return acc;
    }, { low_risk: 0, medium_risk: 0, high_risk: 0 });
    
    return {
      total_students: totalStudents,
      department_distribution: deptCounts,
      risk_distribution: riskDistribution,
      attendance_stats: {
        average: mockStudents.reduce((sum, s) => sum + s.Attendance_Percentage, 0) / totalStudents,
        below_75: mockStudents.filter(s => s.Attendance_Percentage < 75).length,
        below_60: mockStudents.filter(s => s.Attendance_Percentage < 60).length
      },
      academic_stats: {
        average_score: mockStudents.reduce((sum, s) => sum + s.Avg_Test_Score, 0) / totalStudents,
        failing_students: mockStudents.filter(s => s.Subjects_Failed > 0).length,
        below_40: mockStudents.filter(s => s.Avg_Test_Score < 40).length
      },
      source: USE_ML_BACKEND ? 'mock_fallback' : 'mock'
    };
  },

  // Upload CSV data
  async uploadData(studentsData) {
    if (USE_ML_BACKEND) {
      try {
        const response = await apiClient.post('/upload-data', {
          data: studentsData
        });
        return response.data;
      } catch (error) {
        console.warn('Upload API failed, processing locally:', error.message);
      }
    }
    
    // Mock local processing
    const processedData = studentsData.map(student => ({
      ...student,
      dropout_risk: student.Total_Risk_Flags >= 3 ? 2 : student.Total_Risk_Flags >= 1 ? 1 : 0
    }));
    
    return {
      message: 'Data processed successfully (local mock)',
      processed_count: processedData.length,
      data: processedData,
      source: USE_ML_BACKEND ? 'mock_fallback' : 'mock'
    };
  },

  // Check backend status
  async getBackendStatus() {
    try {
      const response = await apiClient.get('/health');
      return {
        available: true,
        ml_available: response.data.ml_available,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      return {
        available: false,
        ml_available: false,
        error: error.message
      };
    }
  }
};