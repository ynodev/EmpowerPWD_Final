import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// InfoBip credentials
const API_KEY = '196120874da788fbb29a4885aaf99921-b3f5e156-070e-4251-b4a3-5e9e20b91f80';
const BASE_URL = 'https://m3xwd2.api.infobip.com';
const SERVICE_NAME = 'EmpowerPwd';

// Helper function to format Philippines phone numbers
const formatPhilippinesNumber = (phoneNumber) => {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Remove leading 0 or 63 if present
  cleaned = cleaned.replace(/^(0|63)/, '');
  
  // Ensure number has 10 digits
  if (cleaned.length !== 10) {
    throw new Error('Invalid phone number length');
  }
  
  // Format as 63XXXXXXXXXX (InfoBip format)
  return `63${cleaned}`;
};

const logSMSDelivery = async (messageData) => {
  try {
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Manila',
      hour12: false 
    });

    const messageRecord = {
      date: timestamp,
      service: SERVICE_NAME,
      direction: 'Outgoing API',
      to: `(PH) +${messageData.to}`,
      body: messageData.text,
      status: messageData.status,
      messageId: messageData.messageId
    };

    console.log(`${SERVICE_NAME} SMS Delivery Log:`, messageRecord);
  } catch (error) {
    console.error(`Error logging ${SERVICE_NAME} SMS delivery:`, error);
  }
};

export const sendSMS = async (toPhoneNumber, message) => {
  try {
    // Format the phone number
    const formattedNumber = formatPhilippinesNumber(toPhoneNumber);
    
    // Format the message
    const formattedMessage = `${message}\n\nFrom: ${SERVICE_NAME}`;
    
    console.log('Attempting to send SMS:', {
      to: formattedNumber,
      message: formattedMessage
    });

    // Create the request body for InfoBip
    const requestBody = {
      messages: [
        {
          destinations: [
            { to: formattedNumber }
          ],
          from: SERVICE_NAME,
          text: formattedMessage
        }
      ]
    };

    // Send message using InfoBip API
    const response = await axios({
      method: 'POST',
      url: `${BASE_URL}/sms/2/text/advanced`,
      headers: {
        'Authorization': `App ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: requestBody
    });

    const messageResult = response.data.messages[0];
    
    console.log('Message sent successfully:', {
      messageId: messageResult.messageId,
      to: messageResult.to,
      status: messageResult.status.name
    });
    
    // Log the delivery
    await logSMSDelivery({
      to: formattedNumber,
      text: formattedMessage,
      status: messageResult.status.name,
      messageId: messageResult.messageId
    });

    return {
      success: true,
      messageId: messageResult.messageId,
      status: messageResult.status.name,
      to: formattedNumber
    };

  } catch (error) {
    console.error(`${SERVICE_NAME} SMS Error:`, {
      to: toPhoneNumber,
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

// Test function to verify number formatting
export const testPhoneNumberFormat = (phoneNumber) => {
  try {
    const formatted = formatPhilippinesNumber(phoneNumber);
    console.log('Phone number format test:', {
      original: phoneNumber,
      formatted: formatted
    });
    return formatted;
  } catch (error) {
    console.error('Phone number format error:', error.message);
    throw error;
  }
};

export default { sendSMS, testPhoneNumberFormat }; 