import React, { useState, useEffect } from 'react';
import { Search, Filter, BarChart3, Users, AlertTriangle, RefreshCw, Upload, Bell, UserCheck, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StudentTable from './components/StudentTable';
import StudentModal from './components/StudentModal';
import DataUpload from './components/DataUpload';
import NotificationCenter from './components/NotificationCenter';
import TrendAnalysis from './components/TrendAnalysis';
import MentorDashboard from './components/MentorDashboard';
import { api } from './services/api';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDataUpload, setShowDataUpload] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    riskLevel: '',
    search: ''
  });

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Apply filters whenever students or filters change
  useEffect(() => {
    applyFilters();
  }, [students, filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(student => student.Department === filters.department);
    }

    // Risk level filter
    if (filters.riskLevel !== '') {
      filtered = filtered.filter(student => student.dropout_risk === parseInt(filters.riskLevel));
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(student => 
        student.Name.toLowerCase().includes(searchLower) ||
        student.Roll_No.toLowerCase().includes(searchLower) ||
        student.Student_ID.toLowerCase().includes(searchLower)
      );
    }

    setFilteredStudents(filtered);
  };

  const handleStudentSelect = async (student) => {
    try {
      setLoading(true);
      const predictionData = await api.predictStudent(student.Student_ID);
      setSelectedStudent(student);
      setPrediction(predictionData);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      alert('Failed to fetch student prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      department: '',
      riskLevel: '',
      search: ''
    });
  };

  const departments = [...new Set(students.map(s => s.Department))].sort();
  const atRiskCount = students.filter(s => s.dropout_risk > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <div className="flex items-center space-x-2 min-w-0">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    AI Dropout Prediction System
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Student Counseling Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{students.length} Students</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className={`font-medium ${atRiskCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {atRiskCount} At Risk
                </span>
              </div>
              
              <button
                onClick={fetchStudents}
                className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8 overflow-x-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                currentView === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView('students')}
              className={`py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                currentView === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Students</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('trends')}
              className={`py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                currentView === 'trends'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('notifications')}
              className={`py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                currentView === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('mentor')}
              className={`py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                currentView === 'mentor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                <span>Mentor</span>
              </div>
            </button>

            <button
              onClick={() => setShowDataUpload(true)}
              className="py-3 px-2 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </div>
            </button>
          </nav>

          {/* Mobile Navigation Header */}
          <div className="md:hidden flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <span className="font-medium text-gray-900 capitalize">
                {currentView === 'trends' ? 'Analytics' : currentView}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Users className="w-3 h-3" />
              <span>{students.length}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
              <span className={atRiskCount > 0 ? 'text-red-600' : 'text-green-600'}>
                {atRiskCount} Risk
              </span>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white py-2">
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 text-xs rounded-lg transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 mb-1" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => {
                    setCurrentView('students');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 text-xs rounded-lg transition-colors ${
                    currentView === 'students'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-5 h-5 mb-1" />
                  <span>Students</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('trends');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 text-xs rounded-lg transition-colors ${
                    currentView === 'trends'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 mb-1" />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('notifications');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 text-xs rounded-lg transition-colors ${
                    currentView === 'notifications'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="w-5 h-5 mb-1" />
                  <span>Alerts</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('mentor');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 text-xs rounded-lg transition-colors ${
                    currentView === 'mentor'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="w-5 h-5 mb-1" />
                  <span>Mentor</span>
                </button>

                <button
                  onClick={() => {
                    setShowDataUpload(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span>Upload</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 md:pb-8">
        {currentView === 'dashboard' && <Dashboard />}
        
        {currentView === 'students' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
              <div className="flex flex-col space-y-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:space-x-2">
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filters.riskLevel}
                    onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Risks</option>
                    <option value="0">Low Risk</option>
                    <option value="1">Medium Risk</option>
                    <option value="2">High Risk</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between sm:block">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                  
                  <div className="text-sm text-gray-600">
                    <span className="sm:hidden">{filteredStudents.length}/{students.length}</span>
                    <span className="hidden sm:inline">Showing {filteredStudents.length} of {students.length} students</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <StudentTable 
                students={filteredStudents} 
                onStudentSelect={handleStudentSelect}
                loading={loading}
              />
            </div>
          </div>
        )}

        {currentView === 'trends' && (
          <TrendAnalysis students={students} />
        )}

        {currentView === 'notifications' && (
          <NotificationCenter students={students} />
        )}

        {currentView === 'mentor' && (
          <MentorDashboard students={students} />
        )}
      </main>

      {/* Data Upload Modal */}
      {showDataUpload && (
        <DataUpload
          onDataUploaded={(newData) => {
            setStudents(newData);
            setShowDataUpload(false);
          }}
          onClose={() => setShowDataUpload(false)}
        />
      )}

      {/* Student Detail Modal */}
      {selectedStudent && prediction && (
        <StudentModal
          student={selectedStudent}
          prediction={prediction}
          onClose={() => {
            setSelectedStudent(null);
            setPrediction(null);
          }}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-900">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;