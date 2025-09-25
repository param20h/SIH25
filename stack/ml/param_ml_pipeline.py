# ================================================================
# AI/ML Pipeline by Param - Dropout Prediction & Recommendations
# ================================================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import pickle
import warnings
warnings.filterwarnings('ignore')

class DropoutPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        
    def load_data(self, filepath="final_clean_students_14k.csv"):
        """Load processed data from Harshita & Shweta"""
        print("📊 Loading processed dataset...")
        self.data = pd.read_csv(filepath)
        print(f"✅ Loaded {len(self.data)} student records")
        return self.data
    
    def create_dropout_labels(self):
        """Create dropout risk labels based on risk flags"""
        print("🎯 Creating dropout risk labels...")
        
        # Define dropout risk based on multiple factors
        self.data['dropout_risk'] = 0  # 0 = Low Risk
        
        # High Risk (3+ flags OR critical combinations)
        high_risk_condition = (
            (self.data['Total_Risk_Flags'] >= 3) |
            ((self.data['Attendance_Flag'] == 1) & (self.data['Score_Flag'] == 1)) |
            (self.data['Subjects_Failed'] >= 3) |
            (self.data['Attendance_Percentage'] < 50)
        )
        self.data.loc[high_risk_condition, 'dropout_risk'] = 2
        
        # Medium Risk (1-2 flags)
        medium_risk_condition = (
            (self.data['Total_Risk_Flags'].between(1, 2)) & 
            (self.data['dropout_risk'] == 0)
        )
        self.data.loc[medium_risk_condition, 'dropout_risk'] = 1
        
        # Display distribution
        risk_counts = self.data['dropout_risk'].value_counts().sort_index()
        print(f"Low Risk (0): {risk_counts.get(0, 0)} students")
        print(f"Medium Risk (1): {risk_counts.get(1, 0)} students")  
        print(f"High Risk (2): {risk_counts.get(2, 0)} students")
        
        return self.data['dropout_risk']
    
    def prepare_features(self):
        """Prepare features for ML model"""
        print("🔧 Preparing features...")
        
        # Select relevant features
        feature_cols = [
            'Attendance_Percentage', 'Monthly_Attendance',
            'Avg_Test_Score', 'Last_Test_Score', 
            'Subjects_Failed', 'Attempts_Exhausted',
            'Fee_Due_Days', 'Semester'
        ]
        
        # Add categorical features
        dept_encoded = pd.get_dummies(self.data['Department'], prefix='Dept')
        fee_status_encoded = pd.get_dummies(self.data['Fee_Status'], prefix='Fee')
        
        # Combine all features
        X = pd.concat([
            self.data[feature_cols],
            dept_encoded,
            fee_status_encoded
        ], axis=1)
        
        y = self.data['dropout_risk']
        
        self.feature_columns = X.columns.tolist()
        print(f"✅ Prepared {len(self.feature_columns)} features")
        
        return X, y
    
    def train_model(self, X, y):
        """Train dropout prediction model"""
        print("🚀 Training ML models...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest
        rf_model = RandomForestClassifier(
            n_estimators=100, 
            max_depth=10, 
            random_state=42
        )
        rf_model.fit(X_train_scaled, y_train)
        
        # Train Logistic Regression
        lr_model = LogisticRegression(
            max_iter=1000, 
            random_state=42
        )
        lr_model.fit(X_train_scaled, y_train)
        
        # Evaluate models
        rf_score = rf_model.score(X_test_scaled, y_test)
        lr_score = lr_model.score(X_test_scaled, y_test)
        
        print(f"Random Forest Accuracy: {rf_score:.3f}")
        print(f"Logistic Regression Accuracy: {lr_score:.3f}")
        
        # Select best model
        if rf_score >= lr_score:
            self.model = rf_model
            print("✅ Selected Random Forest as final model")
        else:
            self.model = lr_model
            print("✅ Selected Logistic Regression as final model")
        
        # Detailed evaluation
        y_pred = self.model.predict(X_test_scaled)
        print("\n📋 Classification Report:")
        print(classification_report(y_test, y_pred, 
                                   target_names=['Low Risk', 'Medium Risk', 'High Risk']))
        
        return self.model
    
    def get_feature_importance(self):
        """Get feature importance for explainability"""
        if hasattr(self.model, 'feature_importances_'):
            importance_df = pd.DataFrame({
                'feature': self.feature_columns,
                'importance': self.model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            print("🔍 Top 10 Most Important Features:")
            print(importance_df.head(10))
            return importance_df
        else:
            print("Model doesn't support feature importance")
            return None
    
    def predict_dropout_risk(self, student_data):
        """Predict dropout risk for new students"""
        if self.model is None:
            raise ValueError("Model not trained yet!")
        
        # Prepare features
        features = student_data[self.feature_columns]
        features_scaled = self.scaler.transform(features.values.reshape(1, -1))
        
        # Make prediction
        risk_level = self.model.predict(features_scaled)[0]
        risk_proba = self.model.predict_proba(features_scaled)[0]
        
        risk_labels = ['Low Risk', 'Medium Risk', 'High Risk']
        
        return {
            'risk_level': risk_labels[risk_level],
            'risk_score': risk_level,
            'confidence': max(risk_proba),
            'probabilities': {
                'low_risk': risk_proba[0],
                'medium_risk': risk_proba[1] if len(risk_proba) > 1 else 0,
                'high_risk': risk_proba[2] if len(risk_proba) > 2 else risk_proba[1] if len(risk_proba) > 1 else 0
            }
        }
    
    def generate_recommendations(self, student_data, prediction):
        """Generate actionable recommendations"""
        recommendations = []
        
        # Attendance-based recommendations
        if student_data['Attendance_Percentage'] < 60:
            recommendations.append({
                'category': 'Attendance',
                'priority': 'High',
                'action': 'Schedule immediate mentor meeting',
                'description': f"Attendance at {student_data['Attendance_Percentage']:.1f}% - Critical intervention needed"
            })
        elif student_data['Attendance_Percentage'] < 75:
            recommendations.append({
                'category': 'Attendance', 
                'priority': 'Medium',
                'action': 'Send attendance warning to student & parents',
                'description': f"Attendance at {student_data['Attendance_Percentage']:.1f}% - Monitor closely"
            })
        
        # Academic performance recommendations
        if student_data['Avg_Test_Score'] < 40:
            recommendations.append({
                'category': 'Academic',
                'priority': 'High', 
                'action': 'Enroll in remedial classes',
                'description': f"Average score {student_data['Avg_Test_Score']:.1f}% - Needs academic support"
            })
        elif student_data['Avg_Test_Score'] < 60:
            recommendations.append({
                'category': 'Academic',
                'priority': 'Medium',
                'action': 'Provide additional study resources',
                'description': f"Average score {student_data['Avg_Test_Score']:.1f}% - Can improve with support"
            })
        
        # Fee-related recommendations
        if student_data['Fee_Due_Days'] > 60:
            recommendations.append({
                'category': 'Financial',
                'priority': 'High',
                'action': 'Urgent financial counseling required',
                'description': f"Fees overdue by {student_data['Fee_Due_Days']} days"
            })
        elif student_data['Fee_Due_Days'] > 30:
            recommendations.append({
                'category': 'Financial',
                'priority': 'Medium', 
                'action': 'Contact for payment plan discussion',
                'description': f"Fees overdue by {student_data['Fee_Due_Days']} days"
            })
        
        # Subject failure recommendations
        if student_data['Subjects_Failed'] >= 2:
            recommendations.append({
                'category': 'Academic',
                'priority': 'High',
                'action': 'Subject-specific tutoring required',
                'description': f"Failed {student_data['Subjects_Failed']} subjects - Risk of academic probation"
            })
        
        return recommendations
    
    def explain_prediction(self, student_data, prediction):
        """Explain why a student was flagged"""
        explanations = []
        
        # Check individual risk factors
        if student_data['Attendance_Percentage'] < 75:
            explanations.append(f"Low attendance: {student_data['Attendance_Percentage']:.1f}%")
        
        if student_data['Avg_Test_Score'] < 60:
            explanations.append(f"Poor academic performance: {student_data['Avg_Test_Score']:.1f}%")
        
        if student_data['Subjects_Failed'] > 0:
            explanations.append(f"Failed subjects: {student_data['Subjects_Failed']}")
        
        if student_data['Fee_Due_Days'] > 0:
            explanations.append(f"Overdue fees: {student_data['Fee_Due_Days']} days")
        
        return {
            'prediction': prediction,
            'main_factors': explanations,
            'explanation': f"Student flagged as {prediction['risk_level']} due to: {', '.join(explanations)}"
        }
    
    def save_model(self, filename="dropout_prediction_model.pkl"):
        """Save trained model"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler, 
            'feature_columns': self.feature_columns
        }
        with open(filename, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"✅ Model saved as {filename}")
    
    def load_model(self, filename="dropout_prediction_model.pkl"):
        """Load pre-trained model"""
        with open(filename, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_columns = model_data['feature_columns']
        print(f"✅ Model loaded from {filename}")

# ================================================================
# Early Warning System
# ================================================================

class EarlyWarningSystem:
    def __init__(self, predictor):
        self.predictor = predictor
    
    def detect_trends(self, student_data):
        """Detect declining trends"""
        warnings = []
        
        # Attendance trend
        if student_data['Monthly_Attendance'] < student_data['Attendance_Percentage'] - 10:
            warnings.append({
                'type': 'Attendance Decline',
                'severity': 'Medium',
                'message': f"Monthly attendance ({student_data['Monthly_Attendance']:.1f}%) significantly lower than overall ({student_data['Attendance_Percentage']:.1f}%)"
            })
        
        # Score trend (if we had historical data)
        if student_data['Last_Test_Score'] < student_data['Avg_Test_Score'] - 15:
            warnings.append({
                'type': 'Performance Decline',
                'severity': 'High', 
                'message': f"Latest test score ({student_data['Last_Test_Score']:.1f}%) much lower than average ({student_data['Avg_Test_Score']:.1f}%)"
            })
        
        return warnings
    
    def get_priority_students(self, data, top_n=10):
        """Get top N priority students for mentor attention"""
        # Score students by urgency
        urgency_score = (
            (data['Attendance_Percentage'] < 60) * 3 +
            (data['Avg_Test_Score'] < 40) * 3 +
            (data['Subjects_Failed'] >= 2) * 2 +
            (data['Fee_Due_Days'] > 60) * 2 +
            (data['Total_Risk_Flags'] * 0.5)
        )
        
        data_with_urgency = data.copy()
        data_with_urgency['urgency_score'] = urgency_score
        
        priority_students = data_with_urgency.nlargest(top_n, 'urgency_score')
        
        return priority_students[['Student_ID', 'Name', 'Department', 'urgency_score', 
                                'Attendance_Percentage', 'Avg_Test_Score', 'Total_Risk_Flags']]

# ================================================================
# Usage Example
# ================================================================

if __name__ == "__main__":
    print("🚀 Starting Dropout Prediction Pipeline...")
    
    # Initialize predictor
    predictor = DropoutPredictor()
    
    # Load data
    data = predictor.load_data("final_clean_students_14k.csv")
    
    # Create labels
    labels = predictor.create_dropout_labels()
    
    # Prepare features and train
    X, y = predictor.prepare_features()
    model = predictor.train_model(X, y)
    
    # Get feature importance
    importance = predictor.get_feature_importance()
    
    # Save model
    predictor.save_model()
    
    # Example prediction for a student
    print("\n🎯 Example Prediction:")
    sample_student = data.iloc[0]  # First student
    prediction = predictor.predict_dropout_risk(sample_student)
    recommendations = predictor.generate_recommendations(sample_student, prediction)
    explanation = predictor.explain_prediction(sample_student, prediction)
    
    print(f"Student: {sample_student['Name']}")
    print(f"Prediction: {prediction['risk_level']}")
    print(f"Confidence: {prediction['confidence']:.2f}")
    print(f"Explanation: {explanation['explanation']}")
    
    print("\n💡 Recommendations:")
    for rec in recommendations:
        print(f"- [{rec['priority']}] {rec['action']}: {rec['description']}")
    
    # Initialize Early Warning System
    ews = EarlyWarningSystem(predictor)
    priority_students = ews.get_priority_students(data, top_n=5)
    
    print("\n🚨 Top 5 Priority Students:")
    print(priority_students)
    
    print("\n✅ ML Pipeline Complete!")