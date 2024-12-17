export const cleanupOldSchedules = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await SpecificSchedule.updateMany(
    { 
      date: { $lt: thirtyDaysAgo },
      status: 'active'
    },
    { 
      $set: { status: 'completed' }
    }
  );
}; 