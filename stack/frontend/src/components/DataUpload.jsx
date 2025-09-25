import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, Eye, Download } from 'lucide-react';

const DataUpload = ({ onDataUploaded, onClose }) => {
  const [uploadedFiles, setUploadedFiles] = useState({
    attendance: null,
    marks: null,
    fees: null
  });
  const [previewData, setPreviewData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Configure
  const [columnMappings, setColumnMappings] = useState({});
  
  const fileInputRefs = {
    attendance: useRef(null),
    marks: useRef(null),
    fees: useRef(null)
  };

  const expectedColumns = {
    attendance: ['Student_ID', 'Name', 'Roll_No', 'Department', 'Attendance_Percentage', 'Monthly_Attendance'],
    marks: ['Student_ID', 'Avg_Test_Score', 'Last_Test_Score', 'Subjects_Failed', 'Attempts_Exhausted'],
    fees: ['Student_ID', 'Fee_Total', 'Fee_Paid', 'Fee_Due_Days', 'Fee_Status']
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;

    setProcessing(true);
    try {
      const data = await parseCSVFile(file);
      setUploadedFiles(prev => ({
        ...prev,
        [type]: { file, data, columns: Object.keys(data[0] || {}) }
      }));
    } catch (error) {
      alert(`Error parsing ${type} file: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const parseCSVFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target.result;
          const lines = csvText.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('File is empty'));
            return;
          }
          
          // Parse headers
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          // Parse data rows
          const data = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            
            headers.forEach((header, i) => {
              row[header] = values[i] || '';
            });
            
            return row;
          }).filter(row => Object.values(row).some(value => value && value.trim()));
          
          if (data.length === 0) {
            reject(new Error('No valid data rows found'));
            return;
          }
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const previewMergedData = () => {
    const { attendance, marks, fees } = uploadedFiles;
    if (!attendance || !marks || !fees) {
      alert('Please upload all three files before previewing');
      return;
    }

    // Simple merge by Student_ID
    const mergedData = attendance.data.map(student => {
      const studentMarks = marks.data.find(m => m.Student_ID === student.Student_ID) || {};
      const studentFees = fees.data.find(f => f.Student_ID === student.Student_ID) || {};
      
      return {
        ...student,
        ...studentMarks,
        ...studentFees,
        // Calculate risk flags
        Attendance_Flag: (student.Attendance_Percentage || 0) < 75 ? 1 : 0,
        Score_Flag: (studentMarks.Avg_Test_Score || 0) < 60 ? 1 : 0,
        Fee_Flag: (studentFees.Fee_Due_Days || 0) > 30 ? 1 : 0,
        Total_Risk_Flags: 0
      };
    }).map(student => ({
      ...student,
      Total_Risk_Flags: student.Attendance_Flag + student.Score_Flag + student.Fee_Flag,
      dropout_risk: student.Attendance_Flag + student.Score_Flag + student.Fee_Flag >= 2 ? 2 : 
                   student.Attendance_Flag + student.Score_Flag + student.Fee_Flag >= 1 ? 1 : 0
    }));

    setPreviewData(mergedData);
    setStep(2);
  };

  const confirmAndUpload = () => {
    if (previewData) {
      onDataUploaded(previewData);
      alert(`✅ Successfully processed ${previewData.length} student records!`);
      onClose();
    }
  };

  const downloadTemplate = (type) => {
    const headers = expectedColumns[type];
    
    // Create CSV content with headers and one sample row
    const sampleData = {
      attendance: ['STU001', 'John Doe', 'Computer Science', '2023', '85', '100', '85.0'],
      marks: ['STU001', '78', '82', '75', '78.3', '90'],
      fees: ['STU001', '50000', '35000', '15', 'Partial']
    };
    
    const csvContent = headers.join(',') + '\n' + sampleData[type].join(',');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Data Upload & Integration</h2>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Upload attendance, marks, and fee payment spreadsheets</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-2">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Upload Spreadsheets</h3>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Upload your existing attendance, marks, and fee data files</p>
              </div>
            </div>

            {/* Upload Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {Object.entries(expectedColumns).map(([type, columns]) => (
                <div key={type} className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <FileSpreadsheet className={`mx-auto h-12 w-12 ${uploadedFiles[type] ? 'text-green-500' : 'text-gray-400'}`} />
                    <h4 className="mt-2 text-lg font-medium text-gray-900 capitalize">{type} Data</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Expected columns: {columns.slice(0, 3).join(', ')}...
                    </p>
                    
                    {uploadedFiles[type] ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">{uploadedFiles[type].file.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {uploadedFiles[type].data.length} records found
                        </div>
                        <button
                          onClick={() => {
                            setUploadedFiles(prev => ({ ...prev, [type]: null }));
                            if (fileInputRefs[type].current) {
                              fileInputRefs[type].current.value = '';
                            }
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          ref={fileInputRefs[type]}
                          type="file"
                          accept=".csv"
                          onChange={(e) => handleFileUpload(type, e.target.files[0])}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRefs[type].current?.click()}
                          disabled={processing}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4 inline mr-2" />
                          Upload File
                        </button>
                        <button
                          onClick={() => downloadTemplate(type)}
                          className="w-full text-gray-600 hover:text-gray-800 text-sm"
                        >
                          <Download className="w-4 h-4 inline mr-1" />
                          Download Template
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Upload Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload files in CSV format only</li>
                <li>• Ensure Student_ID column exists in all files for merging</li>
                <li>• Download templates if you need the correct format</li>
                <li>• Files will be automatically validated and merged</li>
                <li>• Convert Excel files to CSV before uploading</li>
              </ul>
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={previewMergedData}
                disabled={!uploadedFiles.attendance || !uploadedFiles.marks || !uploadedFiles.fees}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview Merged Data
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Data Preview */}
        {step === 2 && previewData && (
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Preview Merged Data</h3>
                <p className="text-gray-600">Review the merged student data and risk calculations</p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{previewData.length}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {previewData.filter(s => s.dropout_risk === 0).length}
                </div>
                <div className="text-sm text-gray-600">Low Risk</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {previewData.filter(s => s.dropout_risk === 1).length}
                </div>
                <div className="text-sm text-gray-600">Medium Risk</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {previewData.filter(s => s.dropout_risk === 2).length}
                </div>
                <div className="text-sm text-gray-600">High Risk</div>
              </div>
            </div>

            {/* Data Preview Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h4 className="font-medium">Sample Data (First 5 Records)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fee Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.slice(0, 5).map((student, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{student.Name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{student.Department}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{student.Attendance_Percentage}%</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{student.Avg_Test_Score}%</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{student.Fee_Status || 'Paid'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            student.dropout_risk === 0 ? 'bg-green-100 text-green-800' :
                            student.dropout_risk === 1 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.dropout_risk === 0 ? 'Low' : student.dropout_risk === 1 ? 'Medium' : 'High'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to Upload
              </button>
              <button
                onClick={confirmAndUpload}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Confirm & Import Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUpload;