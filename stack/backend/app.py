# ================================================================
# Flask API Server for ML Model Integration
# Connects Param's ML Pipeline to Diwaker's Frontend
# ================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import sys
import os
import pickle
from datetime import datetime

# Add ML folder to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ml'))

try:
    from param_ml_pipeline import DropoutPredictor, EarlyWarningSystem
    ML_AVAILABLE = True
except ImportError:
    print("⚠️ ML Pipeline not found - using fallback mode")
    ML_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize ML components
if ML_AVAILABLE:
    try:
        predictor = DropoutPredictor()
        # Try to load existing model or create new one
        try:
            predictor.load_model("../ml/dropout_prediction_model.pkl")
            print("✅ Pre-trained model loaded successfully")
        except:
            print("📚 Training new model...")
            data = predictor.load_data("../ml/final_clean_students_14k.csv")
            labels = predictor.create_dropout_labels()
            X, y = predictor.prepare_features()
            predictor.train_model(X, y)
            predictor.save_model("../ml/dropout_prediction_model.pkl")
            print("✅ New model trained and saved")
        
        ews = EarlyWarningSystem(predictor)
        print("🚀 ML Pipeline initialized successfully")
    except Exception as e:
        print(f"❌ ML initialization failed: {e}")
        ML_AVAILABLE = False

# ================================================================
# API Endpoints
# ================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'ml_available': ML_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/students', methods=['GET'])
def get_all_students():
    """Get all students with risk predictions"""
    try:
        if not ML_AVAILABLE:
            return jsonify({'error': 'ML pipeline not available'}), 500
        
        # Load student data
        data_path = "../ml/final_clean_students_14k.csv"
        students_df = pd.read_csv(data_path)
        
        # Get query parameters for filtering
        department = request.args.get('department')
        risk_level = request.args.get('risk_level')
        limit = request.args.get('limit', 100, type=int)
        
        # Apply filters
        if department:
            students_df = students_df[students_df['Department'] == department]
        
        # Calculate risk levels for all students
        students_list = []
        for _, student in students_df.head(limit).iterrows():
            try:
                prediction = predictor.predict_dropout_risk(student)
                recommendations = predictor.generate_recommendations(student, prediction)
                
                # Filter by risk level if specified
                if risk_level and str(prediction['risk_score']) != str(risk_level):
                    continue
                
                student_data = {
                    'Student_ID': student['Student_ID'],
                    'Name': student['Name'],
                    'Roll_No': student['Roll_No'],
                    'Department': student['Department'],
                    'Semester': int(student['Semester']),
                    'Mentor_ID': student['Mentor_ID'],
                    'Attendance_Percentage': float(student['Attendance_Percentage']),
                    'Avg_Test_Score': float(student['Avg_Test_Score']),
                    'Fee_Status': student['Fee_Status'],
                    'Fee_Due_Days': int(student['Fee_Due_Days']),
                    'Subjects_Failed': int(student['Subjects_Failed']),
                    'Total_Risk_Flags': int(student['Total_Risk_Flags']),
                    'dropout_risk': prediction['risk_score'],
                    'risk_level': prediction['risk_level'],
                    'confidence': prediction['confidence'],
                    'recommendations': recommendations[:3]  # Top 3 recommendations
                }
                students_list.append(student_data)
            except Exception as e:
                print(f"Error processing student {student['Student_ID']}: {e}")
                continue
        
        return jsonify({
            'data': students_list,
            'total': len(students_list),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/student/<student_id>/predict', methods=['GET'])
def predict_student(student_id):
    """Get detailed prediction for specific student"""
    try:
        if not ML_AVAILABLE:
            return jsonify({'error': 'ML pipeline not available'}), 500
        
        # Load student data
        data_path = "../ml/final_clean_students_14k.csv"
        students_df = pd.read_csv(data_path)
        
        # Find specific student
        student_row = students_df[students_df['Student_ID'] == student_id]
        if student_row.empty:
            return jsonify({'error': 'Student not found'}), 404
        
        student = student_row.iloc[0]
        
        # Generate prediction
        prediction = predictor.predict_dropout_risk(student)
        recommendations = predictor.generate_recommendations(student, prediction)
        explanation = predictor.explain_prediction(student, prediction)
        
        return jsonify({
            'student_id': student_id,
            'student_name': student['Name'],
            'department': student['Department'],
            'prediction': prediction,
            'recommendations': recommendations,
            'explanation': explanation,
            'key_stats': {
                'attendance': float(student['Attendance_Percentage']),
                'avg_score': float(student['Avg_Test_Score']),
                'subjects_failed': int(student['Subjects_Failed']),
                'fee_due_days': int(student['Fee_Due_Days'])
            },
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/priority-students', methods=['GET'])
def get_priority_students():
    """Get priority students needing immediate attention"""
    try:
        if not ML_AVAILABLE:
            return jsonify({'error': 'ML pipeline not available'}), 500
        
        # Load student data
        data_path = "../ml/final_clean_students_14k.csv"
        students_df = pd.read_csv(data_path)
        
        # Get priority students
        priority_students = ews.get_priority_students(students_df, top_n=20)
        
        return jsonify({
            'priority_students': priority_students.to_dict('records'),
            'count': len(priority_students),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Get analytics data for dashboard"""
    try:
        if not ML_AVAILABLE:
            return jsonify({'error': 'ML pipeline not available'}), 500
        
        # Load student data
        data_path = "../ml/final_clean_students_14k.csv"
        students_df = pd.read_csv(data_path)
        
        # Calculate analytics
        total_students = len(students_df)
        dept_distribution = students_df['Department'].value_counts().to_dict()
        
        # Risk distribution
        risk_distribution = {
            'low_risk': len(students_df[students_df['Total_Risk_Flags'] == 0]),
            'medium_risk': len(students_df[students_df['Total_Risk_Flags'].between(1, 2)]),
            'high_risk': len(students_df[students_df['Total_Risk_Flags'] >= 3])
        }
        
        # Attendance trends
        attendance_stats = {
            'average': float(students_df['Attendance_Percentage'].mean()),
            'below_75': len(students_df[students_df['Attendance_Percentage'] < 75]),
            'below_60': len(students_df[students_df['Attendance_Percentage'] < 60])
        }
        
        # Academic performance
        academic_stats = {
            'average_score': float(students_df['Avg_Test_Score'].mean()),
            'failing_students': len(students_df[students_df['Subjects_Failed'] > 0]),
            'below_40': len(students_df[students_df['Avg_Test_Score'] < 40])
        }
        
        # Fee status
        fee_stats = students_df['Fee_Status'].value_counts().to_dict()
        
        return jsonify({
            'total_students': total_students,
            'department_distribution': dept_distribution,
            'risk_distribution': risk_distribution,
            'attendance_stats': attendance_stats,
            'academic_stats': academic_stats,
            'fee_stats': fee_stats,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-data', methods=['POST'])
def upload_student_data():
    """Process uploaded CSV data"""
    try:
        if not request.json:
            return jsonify({'error': 'No data provided'}), 400
        
        students_data = request.json.get('data', [])
        if not students_data:
            return jsonify({'error': 'Empty data array'}), 400
        
        # Process each student if ML is available
        if ML_AVAILABLE:
            processed_students = []
            for student in students_data:
                try:
                    # Convert to DataFrame row for prediction
                    student_df = pd.DataFrame([student])
                    prediction = predictor.predict_dropout_risk(student_df.iloc[0])
                    
                    # Add ML predictions to student data
                    student['dropout_risk'] = prediction['risk_score']
                    student['risk_level'] = prediction['risk_level']
                    student['confidence'] = prediction['confidence']
                    
                    processed_students.append(student)
                except Exception as e:
                    print(f"Error processing student: {e}")
                    processed_students.append(student)
            
            return jsonify({
                'message': 'Data processed successfully',
                'processed_count': len(processed_students),
                'data': processed_students
            })
        else:
            return jsonify({
                'message': 'Data received (ML processing unavailable)',
                'processed_count': len(students_data),
                'data': students_data
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================================================================
# Main Application
# ================================================================

if __name__ == '__main__':
    print("🚀 Starting SIH 2025 Dropout Prediction API Server...")
    print("=" * 60)
    print(f"📊 ML Pipeline: {'✅ Available' if ML_AVAILABLE else '❌ Unavailable'}")
    print(f"🌐 CORS: Enabled for frontend communication")
    print(f"📡 Server: Starting on http://localhost:5000")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)