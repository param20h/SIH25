# CSV Data Upload Feature

The application now supports uploading student data from CSV files instead of using mock data. This allows you to integrate real spreadsheet data from your institution.

## Features Added

### 1. Multi-Source Data Upload
- **Attendance Data**: Upload attendance records with percentage calculation
- **Academic Marks**: Upload test scores and assignment completion rates  
- **Fee Payment Data**: Upload fee payment status and due information

### 2. Automatic Data Integration
- Files are merged using Student_ID as the common key
- Risk flags are automatically calculated based on thresholds:
  - Attendance < 75% = Risk Flag
  - Average Test Score < 60% = Risk Flag  
  - Fee Due Days > 30 = Risk Flag
- Overall dropout risk is calculated based on number of risk flags

### 3. Data Validation & Preview
- CSV format validation with error handling
- Preview merged data before importing
- Summary statistics showing risk distribution
- Sample data display for verification

## How to Use

### Step 1: Prepare Your CSV Files
You need three separate CSV files:

#### Attendance File Format:
```csv
Student_ID,Name,Department,Year,Attendance_Days,Total_Days,Attendance_Percentage
STU001,John Doe,Computer Science,2023,85,100,85.0
```

#### Marks File Format:
```csv
Student_ID,Math_Score,Science_Score,English_Score,Avg_Test_Score,Assignment_Completion
STU001,78,82,75,78.3,90
```

#### Fees File Format:
```csv
Student_ID,Fee_Total,Fee_Paid,Fee_Due_Days,Fee_Status
STU001,50000,35000,15,Partial
```

### Step 2: Upload Files
1. Click the "Upload Data" button in the main dashboard
2. Upload all three CSV files (attendance, marks, fees)
3. Download templates if you need the correct format
4. Files are validated automatically

### Step 3: Preview & Import
1. Review the merged data preview
2. Check risk level calculations
3. View summary statistics
4. Click "Confirm & Import Data" to replace mock data

## Sample Files
Sample CSV files are available in `/sample_data/` directory:
- `attendance_sample.csv`
- `marks_sample.csv` 
- `fees_sample.csv`

## Technical Implementation

### CSV Parser
- Uses native JavaScript FileReader API (no external dependencies)
- Handles CSV parsing with comma-separated values
- Removes quotes and trims whitespace
- Validates data completeness

### Data Processing
- Merges three data sources on Student_ID
- Calculates risk indicators automatically
- Generates dropout risk levels (0=Low, 1=Medium, 2=High)
- Maintains data consistency with existing API structure

### Error Handling
- File format validation
- Empty file detection
- Missing column validation
- Data type checking

## Integration Notes
- Replaces mock API data when files are uploaded
- Maintains existing dashboard functionality
- Compatible with all existing components (StudentTable, StudentModal, etc.)
- Risk calculations align with ML model expectations

This feature enables real data integration while maintaining the simplicity of the existing system architecture.