import fetch from 'node-fetch';

export const sendSMS = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    console.log('Received SMS request:', {
      phoneNumber,
      message
    });

    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    if (!cleanedPhoneNumber.match(/^63\d{10}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Must start with 63 followed by 10 digits'
      });
    }

    const response = await fetch('https://6rzd1g.api.infobip.com/sms/2/text/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          destinations: [{
            to: cleanedPhoneNumber
          }],
          from: "JobPortal",
          text: message,
          notifyUrl: "https://your-domain.com/sms/callback",
          callbackData: "Callback data",
          notifyContentType: "application/json",
          validityPeriod: 720,
          regional: {
            indiaDlt: {
              contentTemplateId: "content_template_id",
              principalEntityId: "principal_entity_id"
            }
          }
        }]
      })
    });

    const data = await response.json();
    console.log('Infobip API Response:', data);

    if (!response.ok) {
      const errorMessage = data.requestError?.serviceException?.text || 
                          data.requestError?.messageError?.text ||
                          JSON.stringify(data);
      throw new Error(`SMS API Error: ${errorMessage}`);
    }

    const messageStatus = data.messages?.[0]?.status;
    if (messageStatus) {
      console.log('Message Status:', messageStatus);
    }

    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      data: {
        messageId: data.messages?.[0]?.messageId,
        status: messageStatus,
        to: cleanedPhoneNumber
      }
    });

  } catch (error) {
    console.error('SMS Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS',
      error: error.message,
      details: error.response?.data || error
    });
  }
}; 