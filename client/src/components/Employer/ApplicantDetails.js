import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  margin-bottom: 20px;
  border: none;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const DetailSection = styled.section`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h3 {
    color: #444;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f0f0;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    font-weight: bold;
    color: #666;
    margin-bottom: 5px;
  }

  p {
    margin: 0;
    color: #333;
  }
`;

const ResumeButton = styled.a`
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
    color: white;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
`;

function ApplicantDetails() {
  const [applicant, setApplicant] = useState(null);
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    const fetchApplicantDetails = async () => {
      try {
        const response = await axios.get(`/api/applications/${applicationId}`);
        setApplicant(response.data.data);
      } catch (error) {
        console.error("Error fetching applicant details:", error);
      }
    };

    fetchApplicantDetails();
  }, [applicationId]);

  const handleStatusUpdate = async (status, notes = '', meetingLink = '') => {
    console.log('Updating status with:', { status, notes, meetingLink });
    try {
      const response = await axios.patch(
        `/api/applications/${applicationId}/status`,
        {
          status,
          message: notes
        }
      );

      console.log('Status update response:', response);

      if (response.data.success) {
        if (status === 'accepted' && meetingLink) {
          try {
            console.log('Creating interview record...');
            const interviewResponse = await axios.post('/api/interviews', {
              applicationId: applicationId,
              jobseekerId: applicant.userId,
              employerId: applicant.employerId,
              jobId: applicant.jobId,
              meetingLink: meetingLink,
              status: 'scheduled',
              notes: notes,
              dateTime: null,
              startTime: '',
              endTime: '',
            });
            console.log('Interview created:', interviewResponse);
          } catch (error) {
            console.error('Error creating interview:', error);
            alert('Application accepted but failed to create interview record');
            return;
          }
        }

        setApplicant(prev => ({
          ...prev,
          status: status
        }));

        alert(`Application ${status} successfully`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    }
  };

  const handleAcceptClick = () => {
    console.log('Accept button clicked');
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = async () => {
    console.log('Confirm accept clicked');
    try {
      // Generate meeting link
      console.log('Generating meeting link...');
      const roomResponse = await axios.get('/api/daily/create-room');
      console.log('Room response:', roomResponse);
      const generatedLink = roomResponse.data.url;
      setMeetingLink(generatedLink);

      console.log('Meeting link generated:', generatedLink);
      // Update application status and create interview
      await handleStatusUpdate('accepted', notes, generatedLink);
      
      // Close modal
      setShowAcceptModal(false);
      setNotes('');
      setMeetingLink('');
    } catch (error) {
      console.error('Error in acceptance process:', error);
      alert('Failed to process acceptance');
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        ← Back to Applications
      </BackButton>
      
      {applicant ? (
        <div>
          <h2 style={{ marginBottom: '30px', color: '#333' }}>Applicant Details</h2>
          
          <DetailSection>
            <h3>Personal Information</h3>
            <InfoGrid>
              <InfoItem>
                <label>Full Name:</label>
                <p>{applicant.firstName} {applicant.lastName}</p>
              </InfoItem>
              <InfoItem>
                <label>Email:</label>
                <p>{applicant.email}</p>
              </InfoItem>
              <InfoItem>
                <label>Phone:</label>
                <p>{applicant.phone}</p>
              </InfoItem>
            </InfoGrid>
          </DetailSection>

          <DetailSection>
            <h3>Professional Information</h3>
            <InfoGrid>
              <InfoItem>
                <label>Experience:</label>
                <p>{applicant.experience}</p>
              </InfoItem>
              <InfoItem>
                <label>Skills:</label>
                <p>{applicant.skills}</p>
              </InfoItem>
            </InfoGrid>
          </DetailSection>

          <DetailSection>
            <h3>Education</h3>
            <InfoGrid>
              <InfoItem>
                <label>Degree:</label>
                <p>{applicant.education}</p>
              </InfoItem>
            </InfoGrid>
          </DetailSection>

          <DetailSection>
            <h3>Application Status</h3>
            <InfoGrid>
              <InfoItem>
                <label>Current Status:</label>
                <p>{applicant.status}</p>
              </InfoItem>
              <InfoItem>
                <label>Applied Date:</label>
                <p>{new Date(applicant.createdAt).toLocaleDateString()}</p>
              </InfoItem>
            </InfoGrid>
          </DetailSection>

          <DetailSection>
            <h3>Application Actions</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAcceptClick}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                disabled={applicant?.status === 'accepted'}
              >
                Accept Application
              </button>
              
              <button
                onClick={() => {
                  const message = prompt('Please provide a reason for rejection (optional):');
                  handleStatusUpdate('rejected', message);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                disabled={applicant?.status === 'rejected'}
              >
                Reject Application
              </button>
            </div>
          </DetailSection>

          {applicant.resume && (
            <DetailSection>
              <h3>Documents</h3>
              <ResumeButton 
                href={applicant.resume} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Resume
              </ResumeButton>
            </DetailSection>
          )}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          fontSize: '18px', 
          color: '#666' 
        }}>
          Loading applicant details...
        </div>
      )}

      {showAcceptModal && (
        <Modal>
          <ModalContent>
            <h3>Accept Application</h3>
            <p>Please add any notes for this acceptance:</p>
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes here..."
            />
            <ModalButtons>
              <button
                onClick={() => setShowAcceptModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Confirm Accept
              </button>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default ApplicantDetails; 