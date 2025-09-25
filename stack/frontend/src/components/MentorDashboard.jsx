import React, { useState } from 'react';
import { UserCheck, Calendar, MessageSquare, FileText, Clock, CheckCircle, AlertCircle, User, Phone, Mail } from 'lucide-react';

const MentorDashboard = ({ students = [], currentMentor = 'Dr. Sarah Johnson' }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [interventions, setInterventions] = useState([
    {
      id: 1,
      studentId: 1,
      studentName: 'Rajesh Kumar',
      type: 'academic',
      date: new Date('2024-01-15'),
      status: 'scheduled',
      notes: 'Extra tutoring session for mathematics',
      followUpDate: new Date('2024-01-22'),
      priority: 'high'
    },
    {
      id: 2,
      studentId: 2,
      studentName: 'Priya Sharma',
      type: 'attendance',
      date: new Date('2024-01-10'),
      status: 'completed',
      notes: 'Counseling session completed. Family issues resolved.',
      followUpDate: new Date('2024-01-25'),
      priority: 'medium'
    }
  ]);

  const [meetings, setMeetings] = useState([
    {
      id: 1,
      studentId: 1,
      studentName: 'Rajesh Kumar',
      date: new Date('2024-01-20'),
      time: '14:00',
      type: 'individual',
      agenda: 'Discuss academic performance and study plan',
      status: 'scheduled'
    },
    {
      id: 2,
      studentId: 3,
      studentName: 'Amit Patel',
      date: new Date('2024-01-18'),
      time: '10:30',
      type: 'parent_meeting',
      agenda: 'Parent conference regarding attendance issues',
      status: 'scheduled'
    }
  ]);

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

  // Filter students assigned to this mentor
  const mentorStudents = students.filter(student => student.mentor === currentMentor);
  const highRiskStudents = mentorStudents.filter(student => student.dropout_risk >= 2);
  const mediumRiskStudents = mentorStudents.filter(student => student.dropout_risk === 1);

  const addIntervention = () => {
    if (!newIntervention.studentId || !newIntervention.notes) return;

    const student = mentorStudents.find(s => s.id === parseInt(newIntervention.studentId));
    const intervention = {
      id: interventions.length + 1,
      ...newIntervention,
      studentId: parseInt(newIntervention.studentId),
      studentName: student?.name || '',
      date: new Date(),
      status: 'planned',
      followUpDate: new Date(newIntervention.followUpDate)
    };

    setInterventions([...interventions, intervention]);
    setNewIntervention({
      studentId: '',
      type: 'academic',
      notes: '',
      priority: 'medium',
      followUpDate: ''
    });
  };

  const scheduleMeeting = () => {
    if (!newMeeting.studentId || !newMeeting.date || !newMeeting.time) return;

    const student = mentorStudents.find(s => s.id === parseInt(newMeeting.studentId));
    const meeting = {
      id: meetings.length + 1,
      ...newMeeting,
      studentId: parseInt(newMeeting.studentId),
      studentName: student?.name || '',
      date: new Date(newMeeting.date),
      status: 'scheduled'
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({
      studentId: '',
      date: '',
      time: '',
      type: 'individual',
      agenda: ''
    });
  };

  const markInterventionComplete = (id) => {
    setInterventions(prev => prev.map(intervention =>
      intervention.id === id ? { ...intervention, status: 'completed' } : intervention
    ));
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
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Calendar className="w-5 h-5 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Schedule Meeting</div>
            <div className="text-sm text-gray-600">Book counseling sessions</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <MessageSquare className="w-5 h-5 text-green-600 mb-2" />
            <div className="font-medium text-gray-900">Send Message</div>
            <div className="text-sm text-gray-600">Contact students/parents</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
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
                        <option key={student.id} value={student.id}>{student.name}</option>
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
    </div>
  );
};

export default MentorDashboard;