# SMS API Integration Guide

## Recommended SMS APIs for Testing

### 1. **Twilio** (Most Popular - International)
- **Website**: https://www.twilio.com/
- **Free Credits**: $15 credit for new accounts
- **Pricing**: $0.0075 per SMS (India)
- **Setup**: Requires phone verification
- **Code Example**:
```javascript
const twilio = require('twilio');
const client = twilio('ACCOUNT_SID', 'AUTH_TOKEN');

async function sendSMS(to, message) {
  try {
    const response = await client.messages.create({
      body: message,
      from: '+1234567890', // Your Twilio number
      to: to
    });
    return { success: true, messageId: response.sid };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 2. **Fast2SMS** (India-Specific - Easy Setup)
- **Website**: https://www.fast2sms.com/
- **Free Credits**: 50 SMS for new accounts
- **Pricing**: ₹0.17 per SMS
- **API Key**: Simple API key authentication
- **Code Example**:
```javascript
async function sendSMSFast2SMS(phone, message) {
  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'Authorization': 'YOUR_API_KEY',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'route': 'q',
        'message': message,
        'language': 'english',
        'flash': '0',
        'numbers': phone
      })
    });
    const data = await response.json();
    return { success: data.return, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 3. **MSG91** (India-Specific - Good Features)
- **Website**: https://msg91.com/
- **Free Credits**: 25 SMS for new accounts
- **Pricing**: ₹0.15 per SMS
- **Features**: OTP, Templates, Analytics
- **Code Example**:
```javascript
async function sendSMSMSG91(phone, message) {
  try {
    const response = await fetch(`https://api.msg91.com/api/sendhttp.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: "MSGIND",
        route: "4",
        country: "91",
        sms: [{
          message: message,
          to: [phone]
        }]
      })
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 4. **TextLocal** (International)
- **Website**: https://www.textlocal.com/
- **Free Credits**: 10 SMS for testing
- **Features**: Group messaging, scheduling
- **Code Example**:
```javascript
async function sendSMSTextLocal(phone, message) {
  try {
    const response = await fetch('https://api.textlocal.in/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'apikey': 'YOUR_API_KEY',
        'numbers': phone,
        'message': message,
        'sender': 'TXTLCL'
      })
    });
    const data = await response.json();
    return { success: data.status === 'success', data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Integration Steps

### 1. Choose Your Provider
- **For Testing**: Fast2SMS or MSG91 (easiest for India)
- **For Production**: Twilio (most reliable)

### 2. Get API Credentials
1. Sign up on the chosen platform
2. Verify your account/phone number
3. Get your API key or credentials
4. Add test credits to your account

### 3. Environment Variables
Create a `.env` file in your backend:
```env
SMS_PROVIDER=fast2sms
FAST2SMS_API_KEY=your_api_key_here
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
```

### 4. Backend Implementation (Node.js/Flask)

**Express.js Example**:
```javascript
// routes/sms.js
const express = require('express');
const router = express.Router();

router.post('/send-sms', async (req, res) => {
  const { phone, message } = req.body;
  
  try {
    const result = await sendSMS(phone, message);
    if (result.success) {
      res.json({ success: true, message: 'SMS sent successfully' });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

**Flask Example**:
```python
# app.py
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/api/send-sms', methods=['POST'])
def send_sms():
    data = request.json
    phone = data.get('phone')
    message = data.get('message')
    
    try:
        # Fast2SMS example
        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "route": "q",
            "message": message,
            "language": "english",
            "flash": "0",
            "numbers": phone
        }
        headers = {
            "authorization": "YOUR_API_KEY",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        response = requests.post(url, data=payload, headers=headers)
        result = response.json()
        
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
```

### 5. Frontend Integration
```javascript
// In your React component
const sendSMS = async (phone, message) => {
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, message })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

## Testing Phone Numbers
- India: +91XXXXXXXXXX (10 digits after +91)
- US: +1XXXXXXXXXX
- Most APIs support international format: +[country_code][number]

## Message Templates for Student Alerts

```javascript
const messageTemplates = {
  attendance: (name, percentage) => 
    `Alert: ${name}, your attendance is ${percentage}%. Please contact your mentor immediately to discuss improvement strategies.`,
  
  performance: (name, score) => 
    `Academic Alert: ${name}, your recent test score is ${score}%. Your mentor wants to schedule a support session. Reply YES to confirm.`,
  
  fees: (name, amount) => 
    `Fee Reminder: ${name}, your pending fee amount is ₹${amount}. Please contact the accounts office to avoid any inconvenience.`,
  
  meeting: (name, date, time) => 
    `Meeting Scheduled: ${name}, you have a counseling session on ${date} at ${time}. Please confirm your attendance.`,
  
  intervention: (name, type) => 
    `Support Program: ${name}, you've been enrolled in ${type} intervention. Your mentor will contact you soon with details.`
};
```

## Best Practices
1. **Rate Limiting**: Don't send too many SMS at once
2. **Message Length**: Keep under 160 characters for single SMS
3. **Timing**: Send during business hours (9 AM - 6 PM)
4. **Compliance**: Include opt-out instructions
5. **Testing**: Use your own number for testing first
6. **Error Handling**: Always handle API failures gracefully
7. **Logging**: Log all SMS attempts for audit purposes

## Quick Start (Fast2SMS)
1. Go to https://www.fast2sms.com/
2. Sign up with your phone number
3. Verify OTP
4. Go to API section and copy your API key
5. Test with the provided curl command
6. Integrate into your application

This should get you started with SMS integration for your student counseling system!