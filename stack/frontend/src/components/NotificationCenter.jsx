import React, { useState, useEffect } from 'react';
import { Bell, Settings, Users, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';

const NotificationCenter = ({ students = [] }) => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: true,
    weeklyReport: true,
    threshold: {
      attendance: 75,
      marks: 60,
      feeDays: 30
    }
  });
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    generateNotifications();
  }, [students]);

  const generateNotifications = () => {
    const newNotifications = [];
    const now = new Date();

    students.forEach(student => {
      // Attendance alerts
      if (student.attendance < settings.threshold.attendance) {
        newNotifications.push({
          id: `att-${student.id}`,
          type: 'attendance',
          priority: 'high',
          student: student.name,
          studentId: student.id,
          message: `${student.name} has ${student.attendance}% attendance (below ${settings.threshold.attendance}% threshold)`,
          timestamp: now,
          mentor: student.mentor,
          department: student.department,
          status: 'pending',
          actionRequired: true
        });
      }

      // Performance alerts
      if (student.lastTestScore < settings.threshold.marks) {
        newNotifications.push({
          id: `perf-${student.id}`,
          type: 'performance',
          priority: student.lastTestScore < 40 ? 'high' : 'medium',
          student: student.name,
          studentId: student.id,
          message: `${student.name} scored ${student.lastTestScore}% in recent test (below ${settings.threshold.marks}% threshold)`,
          timestamp: now,
          mentor: student.mentor,
          department: student.department,
          status: 'pending',
          actionRequired: true
        });
      }

      // Fee alerts
      if (student.feeDueDays > settings.threshold.feeDays) {
        newNotifications.push({
          id: `fee-${student.id}`,
          type: 'fees',
          priority: student.feeDueDays > 60 ? 'high' : 'medium',
          student: student.name,
          studentId: student.id,
          message: `${student.name} has pending fees for ${student.feeDueDays} days`,
          timestamp: now,
          mentor: student.mentor,
          department: student.department,
          status: 'pending',
          actionRequired: true
        });
      }

      // Weekly trend alerts
      const trendDrop = student.attendanceTrend && student.attendanceTrend < -5;
      if (trendDrop) {
        newNotifications.push({
          id: `trend-${student.id}`,
          type: 'trend',
          priority: 'medium',
          student: student.name,
          studentId: student.id,
          message: `${student.name} shows declining attendance trend (-${Math.abs(student.attendanceTrend)}% this week)`,
          timestamp: now,
          mentor: student.mentor,
          department: student.department,
          status: 'pending',
          actionRequired: false
        });
      }
    });

    setNotifications(newNotifications);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      attendance: <Users className="w-4 h-4" />,
      performance: <TrendingUp className="w-4 h-4" />,
      fees: <Calendar className="w-4 h-4" />,
      trend: <AlertCircle className="w-4 h-4" />
    };
    return icons[type] || <Bell className="w-4 h-4" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
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
      
      alert(`✅ ${method.toUpperCase()} notification sent to ${notification.mentor} about ${notification.student}`);
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
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notification Center</h2>
            <p className="text-gray-600">Automated alerts and mentor notifications</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={scheduleWeeklyReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Schedule Report
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
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
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
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
      <div className="p-6">
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
                          <span>Mentor: {notification.mentor}</span>
                          <span>Department: {notification.department}</span>
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
                          onClick={() => sendNotification(notification, 'sms')}
                          className="px-3 py-1 bg-white border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50"
                        >
                          📱 SMS
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
                        <span>Sent to: {notification.mentor}</span>
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
    </div>
  );
};

export default NotificationCenter;