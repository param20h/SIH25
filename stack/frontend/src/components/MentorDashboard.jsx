import React, { useState, useEffect } from 'react';
import { UserCheck, Calendar, MessageSquare, FileText, Clock, CheckCircle, AlertCircle, User, Phone, Mail, Plus, Send } from 'lucide-react';

const MentorDashboard = ({ students = [], currentMentor = 'Dr. Sarah Johnson' }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [interventions, setInterventions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [showAddIntervention, setShowAddIntervention] = useState(false);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  
  const [newIntervention, setNewIntervention] = useState({
    studentId: '',
    type: 'academic',
    notes: '',
    priority: 'medium',
    followUpDate: ''
  });

  const [newMeeting, setNewMeeting] = useState({
    studentId: '',
    date: '',
    time: '',
    type: 'individual',
    agenda: ''
  });

  // New state for modals and functionality
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);
  const [messageForm, setMessageForm] = useState({
    recipient: '',
    type: 'sms',
    subject: '',
    message: ''
  });

  // Initialize sample data when students are loaded
  useEffect(() => {
    if (students.length > 0) {
      initializeSampleData();
    }
  }, [students]);

  const initializeSampleData = () => {
    const highRiskStudents = students.filter(s => s.dropout_risk === 2);
    const mediumRiskStudents = students.filter(s => s.dropout_risk === 1);
    
    // Sample interventions based on actual student data
    const sampleInterventions = [
      ...(highRiskStudents.slice(0, 2).map((student, index) => ({
        id: index + 1,
        studentId: student.Student_ID,
        studentName: student.Name,
        studentRollNo: student.Roll_No,
        department: student.Department,
        type: 'academic',
        date: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
        status: index === 0 ? 'active' : 'scheduled',
        notes: index === 0 ? 'Weekly tutoring sessions for core subjects' : 'Parent meeting scheduled to discuss academic progress',
        followUpDate: new Date(Date.now() + (7 + index * 3) * 24 * 60 * 60 * 1000),
        priority: 'high',
        contactInfo: {
          phone: student.Phone || '+91-9876543210',
          email: student.Email || `${student.Student_ID}@college.edu`
        }
      }))),
      ...(mediumRiskStudents.slice(0, 1).map((student, index) => ({
        id: highRiskStudents.length + index + 1,
        studentId: student.Student_ID,
        studentName: student.Name,
        studentRollNo: student.Roll_No,
        department: student.Department,
        type: 'attendance',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        notes: 'Counseling session completed. Student committed to improving attendance.',
        followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        contactInfo: {
          phone: student.Phone || '+91-9876543210',
          email: student.Email || `${student.Student_ID}@college.edu`
        }
      })))
    ];

    // Sample meetings
    const sampleMeetings = [
      ...(highRiskStudents.slice(0, 1).map((student, index) => ({
        id: index + 1,
        studentId: student.Student_ID,
        studentName: student.Name,
        studentRollNo: student.Roll_No,
        department: student.Department,
        date: new Date(Date.now() + (2 + index) * 24 * 60 * 60 * 1000),
        time: '14:00',
        type: 'parent_meeting',
        agenda: 'Discuss academic progress and intervention strategies',
        status: 'scheduled',
        contactInfo: {
          phone: student.Phone || '+91-9876543210',
          email: student.Email || `${student.Student_ID}@college.edu`
        }
      }))),
      ...(mediumRiskStudents.slice(0, 1).map((student, index) => ({
        id: highRiskStudents.length + index + 1,
        studentId: student.Student_ID,
        studentName: student.Name,
        studentRollNo: student.Roll_No,
        department: student.Department,
        date: new Date(Date.now() + (4 + index) * 24 * 60 * 60 * 1000),
        time: '10:30',
        type: 'individual',
        agenda: 'One-on-one counseling session',
        status: 'scheduled',
        contactInfo: {
          phone: student.Phone || '+91-9876543210',
          email: student.Email || `${student.Student_ID}@college.edu`
        }
      })))
    ];

    setInterventions(sampleInterventions);
    setMeetings(sampleMeetings);
  };

  // Filter students assigned to this mentor (for demo, show high and medium risk students)
  const mentorStudents = students.filter(student => student.dropout_risk > 0);
  const highRiskStudents = mentorStudents.filter(student => student.dropout_risk === 2);
  const mediumRiskStudents = mentorStudents.filter(student => student.dropout_risk === 1);

  const addIntervention = () => {
    if (!newIntervention.studentId || !newIntervention.notes) return;

    const student = mentorStudents.find(s => s.Student_ID === newIntervention.studentId);
    const intervention = {
      id: interventions.length + 1,
      ...newIntervention,
      studentName: student?.Name || '',
      studentRollNo: student?.Roll_No || '',
      department: student?.Department || '',
      date: new Date(),
      status: 'planned',
      followUpDate: new Date(newIntervention.followUpDate),
      contactInfo: {
        phone: student?.Phone || '+91-9876543210',
        email: student?.Email || `${newIntervention.studentId}@college.edu`
      }
    };

    setInterventions([...interventions, intervention]);
    setNewIntervention({
      studentId: '',
      type: 'academic',
      notes: '',
      priority: 'medium',
      followUpDate: ''
    });
    setShowAddIntervention(false);
  };

  const scheduleMeeting = () => {
    if (!newMeeting.studentId || !newMeeting.date || !newMeeting.time) return;

    const student = mentorStudents.find(s => s.Student_ID === newMeeting.studentId);
    const meeting = {
      id: meetings.length + 1,
      ...newMeeting,
      studentName: student?.Name || '',
      studentRollNo: student?.Roll_No || '',
      department: student?.Department || '',
      date: new Date(newMeeting.date),
      status: 'scheduled',
      contactInfo: {
        phone: student?.Phone || '+91-9876543210',
        email: student?.Email || `${newMeeting.studentId}@college.edu`
      }
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({
      studentId: '',
      date: '',
      time: '',
      type: 'individual',
      agenda: ''
    });
    setShowAddMeeting(false);
  };

  // Communication functions
  const sendSMS = async (phone, message) => {
    try {
      console.log(`Sending SMS to ${phone}: ${message}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('SMS sent successfully!');
      return { success: true };
    } catch (error) {
      alert('Failed to send SMS');
      return { success: false };
    }
  };

  const sendEmail = async (email, subject, message) => {
    try {
      console.log(`Sending email to ${email}: ${subject}\n${message}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Email sent successfully!');
      return { success: true };
    } catch (error) {
      alert('Failed to send email');
      return { success: false };
    }
  };

  const markInterventionComplete = (id) => {
    setInterventions(prev => prev.map(intervention =>
      intervention.id === id ? { ...intervention, status: 'completed' } : intervention
    ));
  };

  // New handler functions for modals
  const handleScheduleMeeting = () => {
    if (!newMeeting.studentId || !newMeeting.date || !newMeeting.time || !newMeeting.agenda) {
      alert('Please fill all meeting details');
      return;
    }

    const student = mentorStudents.find(s => s.Student_ID === newMeeting.studentId);
    const meeting = {
      id: meetings.length + 1,
      ...newMeeting,
      studentName: student?.Name || '',
      studentRollNo: student?.Roll_No || '',
      department: student?.Department || '',
      date: new Date(newMeeting.date),
      status: 'scheduled',
      contactInfo: {
        phone: student?.Phone || '+91-9876543210',
        email: student?.Email || `${newMeeting.studentId}@college.edu`
      }
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({
      studentId: '',
      date: '',
      time: '',
      type: 'individual',
      agenda: ''
    });
    setShowScheduleMeeting(false);
    alert(`✅ Meeting scheduled successfully with ${student?.Name}!`);
  };

  const handleSendMessage = async () => {
    if (!messageForm.recipient || !messageForm.message) {
      alert('Please fill recipient and message');
      return;
    }

    try {
      if (messageForm.type === 'sms') {
        await sendSMS(messageForm.recipient, messageForm.message);
      } else {
        await sendEmail(messageForm.recipient, messageForm.subject, messageForm.message);
      }
      
      setMessageForm({
        recipient: '',
        type: 'sms',
        subject: '',
        message: ''
      });
      setShowSendMessage(false);
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    }
  };

  const generateStudentReport = (studentId) => {
    const student = mentorStudents.find(s => s.Student_ID === studentId);
    if (!student) return null;

    return {
      studentInfo: {
        name: student.Name,
        rollNo: student.Roll_No,
        department: student.Department,
        semester: student.Semester || 'N/A'
      },
      academicMetrics: {
        attendance: (student.Attendance_Percentage || 0).toFixed(1) + '%',
        avgScore: (student.Avg_Test_Score || 0).toFixed(1) + '%',
        riskLevel: student.dropout_risk === 0 ? 'Low' : student.dropout_risk === 1 ? 'Medium' : 'High'
      },
      interventions: interventions.filter(i => i.studentId === studentId),
      meetings: meetings.filter(m => m.studentId === studentId),
      recommendations: [
        'Regular academic monitoring',
        'Attendance improvement plan',
        'Parent engagement sessions',
        'Peer mentoring support'
      ]
    };
  };

  const handleGenerateReport = () => {
    if (!selectedStudentForAction) {
      alert('Please select a student first');
      return;
    }

    const report = generateStudentReport(selectedStudentForAction);
    
    // Create downloadable report
    const reportContent = `
STUDENT PROGRESS REPORT
Generated by: ${currentMentor}
Date: ${new Date().toLocaleDateString()}

STUDENT INFORMATION:
Name: ${report.studentInfo.name}
Roll No: ${report.studentInfo.rollNo}
Department: ${report.studentInfo.department}
Semester: ${report.studentInfo.semester}

ACADEMIC METRICS:
Attendance: ${report.academicMetrics.attendance}
Average Score: ${report.academicMetrics.avgScore}
Risk Level: ${report.academicMetrics.riskLevel}

INTERVENTIONS (${report.interventions.length}):
${report.interventions.map((i, idx) => 
  `${idx + 1}. ${i.type} - ${i.status} (${i.date.toLocaleDateString()})\n   Notes: ${i.notes}`
).join('\n')}

MEETINGS (${report.meetings.length}):
${report.meetings.map((m, idx) => 
  `${idx + 1}. ${m.type} - ${m.date.toLocaleDateString()} at ${m.time}\n   Agenda: ${m.agenda}`
).join('\n')}

RECOMMENDATIONS:
${report.recommendations.map((r, idx) => `${idx + 1}. ${r}`).join('\n')}
    `;

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.studentInfo.name}_Progress_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowGenerateReport(false);
    setSelectedStudentForAction(null);
    alert(`✅ Report generated for ${report.studentInfo.name}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mentor Dashboard</h2>
              <p className="text-gray-600">{currentMentor}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mentorStudents.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{highRiskStudents.length}</div>
              <div className="text-sm text-gray-600">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{mediumRiskStudents.length}</div>
              <div className="text-sm text-gray-600">Medium Risk</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowScheduleMeeting(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Calendar className="w-5 h-5 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Schedule Meeting</div>
            <div className="text-sm text-gray-600">Book counseling sessions</div>
          </button>
          <button 
            onClick={() => setShowSendMessage(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-green-600 mb-2" />
            <div className="font-medium text-gray-900">Send Message</div>
            <div className="text-sm text-gray-600">Contact students/parents</div>
          </button>
          <button 
            onClick={() => setShowGenerateReport(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <FileText className="w-5 h-5 text-purple-600 mb-2" />
            <div className="font-medium text-gray-900">Generate Report</div>
            <div className="text-sm text-gray-600">Student progress reports</div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'students', label: 'My Students', icon: User },
              { key: 'interventions', label: 'Interventions', icon: AlertCircle },
              { key: 'meetings', label: 'Meetings', icon: Calendar },
              { key: 'progress', label: 'Progress Tracking', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Assigned Students</h3>
                <div className="text-sm text-gray-600">
                  {mentorStudents.length} students assigned
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mentorStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">ID: {student.rollNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.department}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            student.dropout_risk === 0 ? 'bg-green-100 text-green-800' :
                            student.dropout_risk === 1 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.dropout_risk === 0 ? 'Low' : student.dropout_risk === 1 ? 'Medium' : 'High'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.attendance}%</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {student.lastContact || '2 days ago'}
                        </td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-700">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-700">
                            <Calendar className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Interventions Tab */}
          {activeTab === 'interventions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Intervention Tracking</h3>
              </div>

              {/* Add New Intervention */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Plan New Intervention</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select
                      value={newIntervention.studentId}
                      onChange={(e) => setNewIntervention(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select Student</option>
                      {mentorStudents.map(student => (
                        <option key={student.Student_ID} value={student.Student_ID}>
                          {student.Name} ({student.Roll_No})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newIntervention.type}
                      onChange={(e) => setNewIntervention(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="academic">Academic Support</option>
                      <option value="attendance">Attendance Issue</option>
                      <option value="counseling">Personal Counseling</option>
                      <option value="financial">Financial Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newIntervention.priority}
                      onChange={(e) => setNewIntervention(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={newIntervention.notes}
                      onChange={(e) => setNewIntervention(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows="2"
                      placeholder="Intervention details and action plan..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={newIntervention.followUpDate}
                      onChange={(e) => setNewIntervention(prev => ({ ...prev, followUpDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={addIntervention}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Intervention
                  </button>
                </div>
              </div>

              {/* Interventions List */}
              <div className="space-y-4">
                {interventions.map((intervention) => (
                  <div key={intervention.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            intervention.priority === 'high' ? 'bg-red-100 text-red-800' :
                            intervention.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {intervention.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {intervention.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            intervention.status === 'completed' ? 'bg-green-100 text-green-800' :
                            intervention.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {intervention.status}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">{intervention.studentName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{intervention.notes}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                          <span>Created: {intervention.date.toLocaleDateString()}</span>
                          <span>Follow-up: {intervention.followUpDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {intervention.status !== 'completed' && (
                          <button
                            onClick={() => markInterventionComplete(intervention.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button className="px-3 py-1 border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meetings Tab */}
          {activeTab === 'meetings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Meeting Schedule</h3>
              </div>

              {/* Schedule New Meeting */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Schedule New Meeting</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select
                      value={newMeeting.studentId}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select Student</option>
                      {mentorStudents.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={newMeeting.time}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newMeeting.type}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="individual">Individual</option>
                      <option value="parent_meeting">Parent Meeting</option>
                      <option value="group_session">Group Session</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
                  <textarea
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, agenda: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows="2"
                    placeholder="Meeting agenda and objectives..."
                  />
                </div>
                <div className="mt-4">
                  <button
                    onClick={scheduleMeeting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Schedule Meeting
                  </button>
                </div>
              </div>

              {/* Meetings List */}
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{meeting.studentName}</span>
                          <span className="text-xs text-gray-500 capitalize">
                            {meeting.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{meeting.agenda}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>📅 {meeting.date.toLocaleDateString()}</span>
                          <span>🕐 {meeting.time}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {meeting.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Join
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Tracking Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {highRiskStudents.slice(0, 4).map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        High Risk
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Attendance</span>
                          <span className="font-medium">{student.attendance}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${student.attendance >= 75 ? 'bg-green-600' : 'bg-red-600'}`}
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Performance</span>
                          <span className="font-medium">{student.avgTestScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${student.avgTestScore >= 60 ? 'bg-green-600' : 'bg-red-600'}`}
                            style={{ width: `${student.avgTestScore}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Last intervention: {interventions.find(i => i.studentId === student.id)?.date.toLocaleDateString() || 'None'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Meeting</h3>
              <button
                onClick={() => setShowScheduleMeeting(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={newMeeting.studentId}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Student</option>
                  {mentorStudents.map(student => (
                    <option key={student.Student_ID} value={student.Student_ID}>
                      {student.Name} ({student.Roll_No})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                <select
                  value={newMeeting.type}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">Individual Counseling</option>
                  <option value="parent_meeting">Parent Meeting</option>
                  <option value="group_session">Group Session</option>
                  <option value="academic_review">Academic Review</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
                <textarea
                  value={newMeeting.agenda}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, agenda: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Meeting purpose and topics to discuss..."
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowScheduleMeeting(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleMeeting}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showSendMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
              <button
                onClick={() => setShowSendMessage(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="sms"
                      checked={messageForm.type === 'sms'}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, type: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="ml-2 text-sm">SMS</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="email"
                      checked={messageForm.type === 'email'}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, type: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="ml-2 text-sm">Email</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {messageForm.type === 'sms' ? 'Phone Number' : 'Email Address'}
                </label>
                <input
                  type={messageForm.type === 'sms' ? 'tel' : 'email'}
                  value={messageForm.recipient}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={messageForm.type === 'sms' ? '+91-9876543210' : 'student@email.com'}
                />
              </div>
              
              {messageForm.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Message subject..."
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message here..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  {messageForm.message.length}/{messageForm.type === 'sms' ? '160' : '500'} characters
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowSendMessage(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send {messageForm.type === 'sms' ? 'SMS' : 'Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate Progress Report</h3>
              <button
                onClick={() => setShowGenerateReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select
                  value={selectedStudentForAction || ''}
                  onChange={(e) => setSelectedStudentForAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Student</option>
                  {mentorStudents.map(student => (
                    <option key={student.Student_ID} value={student.Student_ID}>
                      {student.Name} ({student.Roll_No}) - Risk: {
                        student.dropout_risk === 0 ? 'Low' : 
                        student.dropout_risk === 1 ? 'Medium' : 'High'
                      }
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Report will include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Student personal and academic information</li>
                  <li>• Attendance and performance metrics</li>
                  <li>• Risk assessment and dropout prediction</li>
                  <li>• Intervention history and outcomes</li>
                  <li>• Meeting records and notes</li>
                  <li>• Recommendations for improvement</li>
                </ul>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowGenerateReport(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  disabled={!selectedStudentForAction}
                >
                  <FileText className="w-4 h-4" />
                  Generate & Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;