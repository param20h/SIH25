# SIH 2025 - Dropout Prediction Frontend

A React-based dashboard for the AI-powered student dropout prediction and counseling system.

## 🎯 Features

- **Dashboard View**: Risk distribution charts, department analytics, priority students
- **Student Management**: Comprehensive table with filtering and search
- **Risk Prediction**: ML-powered dropout risk assessment with explainability
- **Notification System**: Send alerts to students and parents
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠 Tech Stack

- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Axios** for API communication

## 📊 Components

### Dashboard
- Risk distribution pie chart
- Department-wise risk analysis
- Priority students list
- Key statistics cards

### Student Table
- Filterable student list
- Risk badges and indicators
- Quick actions (View Details, Send Alert)
- Search and department filters

### Student Modal
- Detailed risk assessment
- Prediction confidence scores
- Risk factor explanations
- Personalized recommendations
- Academic metrics overview

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx       # Main dashboard with charts
│   ├── StudentTable.jsx    # Student list with filters
│   ├── StudentModal.jsx    # Detailed student view
│   └── RiskBadge.jsx      # Risk level indicator
├── services/
│   └── api.js             # Mock API calls
├── App.jsx                # Main application
├── main.jsx              # Entry point
└── index.css             # Tailwind styles
```

## 🔌 API Integration

The frontend uses a mock API (`src/services/api.js`) that simulates:

- Student data fetching with filters
- ML prediction results
- Notification sending
- Risk statistics

Replace mock API calls with real backend endpoints:

```javascript
// Replace in api.js
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async getStudents() {
    const response = await axios.get(`${API_BASE_URL}/students`);
    return response.data;
  },
  // ... other API calls
};
```

## 📊 Mock Data

The app includes realistic mock data based on the ML team's processed dataset:

- 6 sample students with varying risk levels
- Attendance percentages, test scores, risk flags
- Departments: CSE, IT, CE, EEE
- Risk levels: Low (0), Medium (1), High (2)

## 🎨 Styling

Uses Tailwind CSS with custom color scheme:

- **Primary**: Blue tones for main UI
- **Success**: Green for low risk
- **Warning**: Yellow for medium risk  
- **Danger**: Red for high risk

## 🔧 Customization

### Adding New Filters
Add filter options in `App.jsx`:

```javascript
const [filters, setFilters] = useState({
  department: '',
  riskLevel: '',
  semester: '', // New filter
  search: ''
});
```

### Adding New Charts
Use Recharts components in `Dashboard.jsx`:

```javascript
import { LineChart, Line } from 'recharts';

// Add trend analysis chart
<LineChart data={trendData}>
  <Line dataKey="risk_score" stroke="#8884d8" />
</LineChart>
```

## 📱 Responsive Design

- **Desktop**: Full layout with sidebar navigation
- **Tablet**: Collapsible navigation, adjusted grids
- **Mobile**: Stack layout, simplified tables

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Deploy Options
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist` folder
- **GitHub Pages**: Use `gh-pages` package

## 🔗 Integration with Team

### For Aksh (Backend):
- Replace mock API with real endpoints
- Add authentication headers
- Handle error responses

### For Param (ML):
- Prediction API should match mock structure
- Include confidence scores and explanations
- Return recommendations array

### For Tanishq (Security):
- Add JWT token handling
- Implement role-based access
- Secure API endpoints

## 📝 Environment Variables

Create `.env` file for configuration:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=SIH Dropout Prediction
VITE_NOTIFICATION_API_KEY=your_twilio_key
```

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Not Working
```bash
# Rebuild CSS
npm run build
```

### API Errors
Check browser console and network tab for detailed error messages.

## 🎯 Next Steps

1. **Backend Integration**: Replace mock API with real endpoints
2. **Authentication**: Add login/logout functionality  
3. **Real-time Updates**: WebSocket for live notifications
4. **Advanced Filters**: Date ranges, mentor assignments
5. **Export Features**: PDF reports, CSV downloads
6. **Mobile App**: React Native version

## 📄 License

MIT License - Built for SIH 2025

---

**Team**: Smart25 | **Frontend**: Diwaker | **Built with** ❤️ **using React & Vite**