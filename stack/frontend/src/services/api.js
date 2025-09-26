// Mock API service for development - Replace with real API calls later
import axios from 'axios';

// Mock student data based on Param's ML work
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
    Attempts_Exhausted: 0,
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
    Attempts_Exhausted: 0,
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
    Attempts_Exhausted: 1,
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
    Attempts_Exhausted: 0,
    Fee_Due_Days: 25,
    Total_Risk_Flags: 2,
    dropout_risk: 1
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
    Attempts_Exhausted: 0,
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
    Attempts_Exhausted: 2,
    Fee_Due_Days: 120,
    Total_Risk_Flags: 4,
    dropout_risk: 2
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API functions
export const api = {
  // Get all students
  async getStudents(filters = {}) {
    await delay(500);
    let filteredStudents = [...mockStudents];
    
    if (filters.department) {
      filteredStudents = filteredStudents.filter(s => s.Department === filters.department);
    }
    
    if (filters.riskLevel !== undefined) {
      filteredStudents = filteredStudents.filter(s => s.dropout_risk === filters.riskLevel);
    }
    
    if (filters.mentorId) {
      filteredStudents = filteredStudents.filter(s => s.Mentor_ID === filters.mentorId);
    }
    
    return {
      data: filteredStudents,
      total: filteredStudents.length
    };
  },

  // Get single student prediction
  async predictStudent(studentId) {
    await delay(300);
    const student = mockStudents.find(s => s.Student_ID === studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }

    // Ensure all numeric values have defaults
    const safeStudent = {
      ...student,
      Attendance_Percentage: student.Attendance_Percentage || 0,
      Avg_Test_Score: student.Avg_Test_Score || 0,
      Subjects_Failed: student.Subjects_Failed || 0,
      Fee_Due_Days: student.Fee_Due_Days || 0,
      dropout_risk: student.dropout_risk || 0
    };

    // Mock prediction based on student data
    const riskLabels = ['Low Risk', 'Medium Risk', 'High Risk'];
    const recommendations = [];

    // Generate recommendations based on risk factors
    if (safeStudent.Attendance_Percentage < 60) {
      recommendations.push({
        category: 'Attendance',
        priority: safeStudent.Attendance_Percentage < 50 ? 'High' : 'Medium',
        action: safeStudent.Attendance_Percentage < 50 ? 'Schedule immediate mentor meeting' : 'Send attendance warning',
        description: `Attendance at ${(safeStudent.Attendance_Percentage || 0).toFixed(1)}% - Intervention needed`,
        timeline: safeStudent.Attendance_Percentage < 50 ? 'Within 24 hours' : 'Within 1 week'
      });
    }

    if (safeStudent.Avg_Test_Score < 50) {
      recommendations.push({
        category: 'Academic',
        priority: safeStudent.Avg_Test_Score < 40 ? 'High' : 'Medium',
        action: safeStudent.Avg_Test_Score < 40 ? 'Enroll in remedial classes' : 'Provide study resources',
        description: `Average score ${(safeStudent.Avg_Test_Score || 0).toFixed(1)}% - Academic support needed`,
        timeline: 'Start next week'
      });
    }

    if (safeStudent.Fee_Due_Days > 30) {
      recommendations.push({
        category: 'Financial',
        priority: safeStudent.Fee_Due_Days > 60 ? 'High' : 'Medium',
        action: safeStudent.Fee_Due_Days > 60 ? 'Urgent financial counseling' : 'Payment plan discussion',
        description: `Fees overdue by ${safeStudent.Fee_Due_Days} days`,
        timeline: safeStudent.Fee_Due_Days > 60 ? 'Immediate' : 'Within 1 week'
      });
    }

    return {
      student_id: studentId,
      student_name: safeStudent.Name,
      department: safeStudent.Department,
      prediction: {
        risk_level: riskLabels[safeStudent.dropout_risk],
        risk_score: safeStudent.dropout_risk,
        confidence: 0.85 + Math.random() * 0.1, // Mock confidence
        probabilities: {
          low_risk: safeStudent.dropout_risk === 0 ? 0.8 : safeStudent.dropout_risk === 1 ? 0.3 : 0.1,
          medium_risk: safeStudent.dropout_risk === 1 ? 0.6 : 0.2,
          high_risk: safeStudent.dropout_risk === 2 ? 0.8 : safeStudent.dropout_risk === 1 ? 0.1 : 0.1
        }
      },
      recommendations,
      explanation: {
        main_factors: [
          safeStudent.Attendance_Percentage < 75 && `Low attendance: ${(safeStudent.Attendance_Percentage || 0).toFixed(1)}%`,
          safeStudent.Avg_Test_Score < 60 && `Poor performance: ${(safeStudent.Avg_Test_Score || 0).toFixed(1)}%`,
          safeStudent.Subjects_Failed > 0 && `Failed subjects: ${safeStudent.Subjects_Failed}`,
          safeStudent.Fee_Due_Days > 0 && `Overdue fees: ${safeStudent.Fee_Due_Days} days`
        ].filter(Boolean)
      },
      key_stats: {
        attendance: safeStudent.Attendance_Percentage,
        avg_score: safeStudent.Avg_Test_Score,
        subjects_failed: safeStudent.Subjects_Failed,
        fee_due_days: safeStudent.Fee_Due_Days
      }
    };
  },

  // Send notification
  async sendNotification(studentId, message, type = 'warning') {
    await delay(200);
    const student = mockStudents.find(s => s.Student_ID === studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }

    // Mock notification success
    return {
      success: true,
      message: `Notification sent to ${student.Name} and parents`,
      timestamp: new Date().toISOString(),
      notification_id: `NOTIF_${Date.now()}`
    };
  },

  // Get risk distribution stats
  async getRiskStats() {
    await delay(200);
    const stats = mockStudents.reduce((acc, student) => {
      const riskLevel = student.dropout_risk;
      acc[riskLevel] = (acc[riskLevel] || 0) + 1;
      return acc;
    }, {});

    return {
      low_risk: stats[0] || 0,
      medium_risk: stats[1] || 0,
      high_risk: stats[2] || 0,
      total_students: mockStudents.length
    };
  },

  // Get priority students
  async getPriorityStudents(limit = 10) {
    await delay(300);
    const priorityStudents = [...mockStudents]
      .map(student => ({
        ...student,
        urgency_score: (
          (student.Attendance_Percentage < 60 ? 3 : 0) +
          (student.Avg_Test_Score < 40 ? 3 : 0) +
          (student.Subjects_Failed >= 2 ? 2 : 0) +
          (student.Fee_Due_Days > 60 ? 2 : 0) +
          (student.Total_Risk_Flags * 0.5)
        )
      }))
      .sort((a, b) => b.urgency_score - a.urgency_score)
      .slice(0, limit);

    return priorityStudents;
  }
};

// Export default for convenience
export default api;