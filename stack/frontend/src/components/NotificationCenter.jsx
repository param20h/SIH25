import React, { useState, useEffect } from 'react';
import { Bell, Settings, Users, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, MessageSquare, Send, Phone } from 'lucide-react';

const NotificationCenter = ({ students = [] }) => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
    whatsappEnabled: true,
    weeklyReport: true,
    threshold: {
      attendance: 75,
      marks: 60,
      feeDays: 30
    }
  });
  const [activeTab, setActiveTab] = useState('alerts');
  const [smsModal, setSmsModal] = useState({ show: false, student: null, message: '' });

  useEffect(() => {
    generateNotifications();
  }, [students]);

  const generateNotifications = () => {
    const newNotifications = [];
    const now = new Date();

    students.forEach(student => {
      // Attendance alerts
      if ((student.Attendance_Percentage || 0) < settings.threshold.attendance) {
        newNotifications.push({
          id: `att-${student.Student_ID}`,
          type: 'attendance',
          priority: (student.Attendance_Percentage || 0) < 60 ? 'high' : 'medium',
          student: student.Name || 'Unknown Student',
          studentId: student.Student_ID,
          rollNo: student.Roll_No,
          department: student.Department,
          message: `${student.Name} has ${(student.Attendance_Percentage || 0).toFixed(1)}% attendance (below ${settings.threshold.attendance}% threshold)`,
          timestamp: now,
          status: 'pending',
          actionRequired: true,
          contactInfo: {
            phone: student.Phone || '+91-9876543210',
            email: student.Email || `${student.Student_ID}@college.edu`
          }
        });
      }

      // Performance alerts
      if ((student.Avg_Test_Score || 0) < settings.threshold.marks) {
        newNotifications.push({
          id: `perf-${student.Student_ID}`,
          type: 'performance',
          priority: (student.Avg_Test_Score || 0) < 40 ? 'high' : 'medium',
          student: student.Name || 'Unknown Student',
          studentId: student.Student_ID,
          rollNo: student.Roll_No,
          department: student.Department,
          message: `${student.Name} scored ${(student.Avg_Test_Score || 0).toFixed(1)}% in recent tests (below ${settings.threshold.marks}% threshold)`,
          timestamp: now,
          status: 'pending',
          actionRequired: true,
          contactInfo: {
            phone: student.Phone || '+91-9876543210',
            email: student.Email || `${student.Student_ID}@college.edu`
          }
        });
      }

      // Fee payment alerts (if applicable)
      if (student.Fee_Status === 'Pending' || student.Fee_Outstanding > 0) {
        newNotifications.push({
          id: `fee-${student.Student_ID}`,
          type: 'fees',
          priority: 'medium',
          student: student.Name || 'Unknown Student',
          studentId: student.Student_ID,
          rollNo: student.Roll_No,
          department: student.Department,
          message: `Fee payment pending for ${student.Name} - Amount: ₹${student.Fee_Outstanding || 'N/A'}`,
          timestamp: now,
          status: 'pending',
          actionRequired: true,
          contactInfo: {
            phone: student.Phone || '+91-9876543210',
            email: student.Email || `${student.Student_ID}@college.edu`
          }
        });
      }

      // High dropout risk alerts
      if (student.dropout_risk === 2) {
        newNotifications.push({
          id: `risk-${student.Student_ID}`,
          type: 'high_risk',
          priority: 'critical',
          student: student.Name || 'Unknown Student',
          studentId: student.Student_ID,
          rollNo: student.Roll_No,
          department: student.Department,
          message: `${student.Name} is at HIGH RISK of dropout. Immediate intervention required.`,
          timestamp: now,
          status: 'pending',
          actionRequired: true,
          contactInfo: {
            phone: student.Phone || '+91-9876543210',
            email: student.Email || `${student.Student_ID}@college.edu`
          }
        });
      }
    });

    // Sort by priority and timestamp
    newNotifications.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    setNotifications(newNotifications);

  // SMS and Communication Functions
  const sendSMS = async (phone, message) => {
    try {
      // Demo SMS sending function - replace with actual API
      console.log(`Sending SMS to ${phone}: ${message}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, use APIs like:
      // - Twilio: https://www.twilio.com/
      // - TextLocal: https://www.textlocal.com/
      // - MSG91: https://msg91.com/
      // - Fast2SMS: https://www.fast2sms.com/
      
      return { success: true, message: 'SMS sent successfully' };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, message: 'Failed to send SMS' };
    }
  };

  const sendEmail = async (email, subject, message) => {
    try {
      console.log(`Sending email to ${email}: ${subject}\n${message}`);
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: 'Failed to send email' };
    }
  };

  const handleSendSMS = async () => {
    if (!smsModal.student || !smsModal.message) return;
    
    const result = await sendSMS(smsModal.student.contactInfo.phone, smsModal.message);
    
    if (result.success) {
      alert('SMS sent successfully!');
      setSmsModal({ show: false, student: null, message: '' });
      
      // Mark notification as actioned
      setNotifications(prev => prev.map(notif => 
        notif.studentId === smsModal.student.studentId 
          ? { ...notif, status: 'actioned', lastContact: new Date() }
          : notif
      ));
    } else {
      alert('Failed to send SMS: ' + result.message);
    }
  };
  };

  const getNotificationIcon = (type) => {
    const icons = {
      attendance: <Users className="w-4 h-4" />,
      performance: <TrendingUp className="w-4 h-4" />,
      fees: <Calendar className="w-4 h-4" />,
      high_risk: <AlertCircle className="w-4 h-4" />,
      trend: <AlertCircle className="w-4 h-4" />
    };
    return icons[type] || <Bell className="w-4 h-4" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[priority] || colors.medium;
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, status: 'read' } : notif
    ));
  };

  const sendNotification = async (notification, method) => {
    // Simulate sending notification
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    
    try {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Update notification status
      setNotifications(prev => prev.map(notif => 
        notif.id === notification.id ? { 
          ...notif, 
          status: 'sent',
          sentMethods: [...(notif.sentMethods || []), method],
          sentAt: new Date()
        } : notif
      ));
      
      alert(`✅ ${method.toUpperCase()} notification sent to ${notification.student} (${notification.department} Dept)`);
    } catch (error) {
      alert(`❌ Failed to send ${method} notification: ${error.message}`);
    }
  };

  const scheduleWeeklyReport = () => {
    const reportData = {
      totalStudents: students.length,
      atRiskStudents: notifications.filter(n => n.priority === 'high').length,
      departmentBreakdown: {},
      trends: {}
    };

    alert(`📊 Weekly report scheduled. Summary: ${reportData.totalStudents} students, ${reportData.atRiskStudents} at high risk`);
  };

  const activeNotifications = notifications.filter(n => n.status === 'pending');
  const sentNotifications = notifications.filter(n => n.status === 'sent');
  const readNotifications = notifications.filter(n => n.status === 'read');

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Notification Center</h2>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Automated alerts and mentor notifications</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={scheduleWeeklyReport}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Schedule Report
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
          {[
            { key: 'alerts', label: 'Active Alerts', count: activeNotifications.length },
            { key: 'sent', label: 'Sent', count: sentNotifications.length },
            { key: 'settings', label: 'Settings', count: 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-2 flex-shrink-0`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Active Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {activeNotifications.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
                <p className="mt-1 text-sm text-gray-500">All students are within acceptable thresholds</p>
              </div>
            ) : (
              activeNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            notification.priority === 'critical' ? 'bg-red-600 text-white' :
                            notification.priority === 'high' ? 'bg-red-600 text-white' :
                            notification.priority === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {notification.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {notification.type}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {notification.message}
                        </p>
                        <div className="mt-1 text-xs text-gray-500 flex items-center space-x-4">
                          <span>Department: {notification.department}</span>
                          <span>Roll No: {notification.rollNo}</span>
                          <span>{notification.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {settings.emailEnabled && (
                        <button
                          onClick={() => sendNotification(notification, 'email')}
                          className="px-3 py-1 bg-white border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50"
                        >
                          📧 Email
                        </button>
                      )}
                      {settings.smsEnabled && (
                        <button
                          onClick={() => setSmsModal({ 
                            show: true, 
                            student: { 
                              ...notification, 
                              contactInfo: notification.contactInfo 
                            }, 
                            message: `Alert: ${notification.message}. Please contact the student immediately.` 
                          })}
                          className="px-3 py-1 bg-white border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          SMS
                        </button>
                      )}
                      {settings.whatsappEnabled && (
                        <button
                          onClick={() => sendNotification(notification, 'whatsapp')}
                          className="px-3 py-1 bg-white border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50"
                        >
                          📞 WhatsApp
                        </button>
                      )}
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Mark Read
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sent Notifications Tab */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentNotifications.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sent notifications</h3>
                <p className="mt-1 text-sm text-gray-500">Sent notifications will appear here</p>
              </div>
            ) : (
              sentNotifications.map((notification) => (
                <div key={notification.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                      <div className="mt-1 text-xs text-gray-500 flex items-center space-x-4">
                        <span>Sent to: {notification.department} Department</span>
                        <span>Methods: {notification.sentMethods?.join(', ')}</span>
                        <span>At: {notification.sentAt?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            
            {/* Communication Channels */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Communication Channels</h4>
              <div className="space-y-3">
                {[
                  { key: 'emailEnabled', label: 'Email Notifications', icon: '📧' },
                  { key: 'smsEnabled', label: 'SMS Alerts', icon: '📱' },
                  { key: 'whatsappEnabled', label: 'WhatsApp Messages', icon: '📞' }
                ].map((channel) => (
                  <label key={channel.key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings[channel.key]}
                      onChange={(e) => setSettings(prev => ({ ...prev, [channel.key]: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">
                      {channel.icon} {channel.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Alert Thresholds */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Alert Thresholds</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendance Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={settings.threshold.attendance}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      threshold: { ...prev.threshold, attendance: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={settings.threshold.marks}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      threshold: { ...prev.threshold, marks: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Overdue (Days)
                  </label>
                  <input
                    type="number"
                    value={settings.threshold.feeDays}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      threshold: { ...prev.threshold, feeDays: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Report Schedule */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Report Schedule</h4>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.weeklyReport}
                  onChange={(e) => setSettings(prev => ({ ...prev, weeklyReport: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">
                  📊 Send weekly summary reports to department heads
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SMS Modal */}
      {smsModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send SMS Alert</h3>
              <button
                onClick={() => setSmsModal({ show: false, student: null, message: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student: {smsModal.student?.student}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone: {smsModal.student?.contactInfo?.phone}
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={smsModal.message}
                  onChange={(e) => setSmsModal(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your message..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  {smsModal.message.length}/160 characters
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setSmsModal({ show: false, student: null, message: '' })}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendSMS}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;