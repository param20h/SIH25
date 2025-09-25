import React, { useState, useEffect } from 'react';
import { Search, Filter, BarChart3, Users, AlertTriangle, RefreshCw } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StudentTable from './components/StudentTable';
import StudentModal from './components/StudentModal';
import { api } from './services/api';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SIH 2025 - Dropout Prediction System</h1>
                  <p className="text-sm text-gray-600">AI-based Student Counseling Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{students.length} Total Students</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className={`font-medium ${atRiskCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {atRiskCount} At Risk
                </span>
              </div>
              
              <button
                onClick={fetchStudents}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
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
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
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
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <Dashboard />}
        
        {currentView === 'students' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, roll no..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
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
                  <option value="">All Risk Levels</option>
                  <option value="0">Low Risk</option>
                  <option value="1">Medium Risk</option>
                  <option value="2">High Risk</option>
                </select>
                
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
                
                <div className="text-sm text-gray-600">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
              </div>
            </div>

            {/* Students Table */}
            <StudentTable 
              students={filteredStudents} 
              onStudentSelect={handleStudentSelect}
              loading={loading}
            />
          </div>
        )}
      </main>

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