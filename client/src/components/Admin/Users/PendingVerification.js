import React from 'react';
import UserManagementSystem from '../userManagement';

const PendingVerification = () => {
  return <UserManagementSystem userType="all" isVerifiedFilter={false} />;
};

export default PendingVerification; 