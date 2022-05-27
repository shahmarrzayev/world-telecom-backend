const getQueryForUserActivity = filters => {
    if (!filters) return null;
    const query = {};
    if (filters.email) query.email = filters.email;
    if (filters.userFirstName) query.userFirstName = filters.userFirstName;
    if (filters.activityType) query.activityType = filters.activityType;
    if (filters.from) query.createdAt = { $gte: filters.from };
    if (filters.to) query.createdAt = { $lte: filters.to };
    return query;
};

module.exports = {
    getQueryForUserActivity,
};
