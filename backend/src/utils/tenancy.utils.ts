export const getActiveTenancyFilter = () => {
  return {
    status: "ACTIVE",
    $or: [{ endDate: { $exists: false } }, { endDate: { $gt: new Date() } }],
  };
};
