const moment = require("moment");

const { SEARCH_STATUS } = require("../constants");
const { ProfileClick, Search, User } = require("../models");
const { getSafeUserToReturn } = require("../utils");

const getCurrentUser = async (currentUser) => {
  const paymentController = require("./payment.controller");

  currentUser = getSafeUserToReturn(currentUser);

  // delete currentUser.verificationToken;

  currentUser.subscription = await paymentController.getUserSubscription(
    currentUser._id
  );

  return currentUser;
};

const getProvider = async ({ userId: providerId }, { _id: userId }) => {
  const query = {
    _id: providerId,
  };

  const searchedUser = await User.findOne(query);

  if (!searchedUser) {
    throw createError(404, `User does not exist by this id!`);
  }

  const clickedProfileData = {
    user: userId,
    lawyer: providerId,
  };

  const savedClickedProfile = await ProfileClick.create(clickedProfileData);

  if (!savedClickedProfile) {
    throw createError(422, `Profile not saved`);
  }

  return searchedUser;
};

const getUserSearches = async (
  { filters: { isBookmarkedOnly } = false },
  { page = 1, limit = 10 },
  { _id: currentUserId }
) => {
  let query = {
    user: currentUserId,
    status: SEARCH_STATUS.ACTIVE,
  };

  if (isBookmarkedOnly) {
    query.bookmarkedLawyers = { $exists: true, $ne: [] };
  }

  const [totalRecords, mySearches] = await Promise.all([
    Search.count(query),
    Search.find(query)
      .skip((parseInt(page) - 1) * parseInt(limit) + 1)
      .limit(limit)
      .populate("bookmarkedLawyers", "profilePicture firstName lastName"),
    ,
  ]);

  return { totalRecords, mySearches };
};

const findAllSearchesByQuery = async (query, filters) => {
  let oldSearchesByQuery = [];

  if (filters) {
    const diffInDays = moment(filters?.toDate).diff(filters?.fromDate, "days");

    const oldFromDate = moment(filters?.fromDate).subtract(diffInDays, "days");

    const oldToDate = moment(filters?.toDate).subtract(diffInDays, "days");

    query.$and = [
      { createdAt: { $gte: moment(filters?.fromDate) } },
      { createdAt: { $lte: moment(filters?.toDate) } },
    ];

    const oldSearchQuery = {
      ...query,
      $and: [
        { createdAt: { $gte: oldFromDate } },
        { createdAt: { $lte: oldToDate } },
      ],
    };
    oldSearchesByQuery = await Search.find(oldSearchQuery).sort({ id: -1 });
  }

  const allSearchesByQuery = await Search.find(query).sort({ id: -1 });

  if (!(allSearchesByQuery.length > 0)) {
    false;
  }

  return { allSearchesByQuery, oldSearchesByQuery };
};

const getBookmarksData = (userId, oldSearchesList, searchesList) => {
  const oldBookmarks = oldSearchesList.filter((item) =>
    item.bookmarkedLawyers.map((b) => b.toString()).includes(userId)
  );

  const bookmarks = searchesList.filter((item) =>
    item.bookmarkedLawyers.map((b) => b.toString()).includes(userId)
  );

  const bookmarksCount = bookmarks.length;
  let bookmarksPercentage = 0;

  if (oldBookmarks.length) {
    bookmarksPercentage =
      ((bookmarks.length - oldBookmarks.length) / oldBookmarks.length) * 100;
  } else {
    bookmarksPercentage = (bookmarks.length - oldBookmarks.length) * 100;
  }

  return {
    bookmarksCount,
    bookmarksPercentage,
  };
};

const getProfileClicksData = async (lawyerId, filters) => {
  let profileClicksCount = 0,
    oldProfileClicksCount = 0,
    oldProfileClicksQuery = {},
    profileClicksQuery = {};

  if (filters) {
    const diffInDays = moment(filters?.toDate).diff(filters?.fromDate, "days");

    const oldFromDate = moment(filters?.fromDate).subtract(diffInDays, "days");

    const oldToDate = moment(filters?.toDate).subtract(diffInDays, "days");

    profileClicksQuery.$and = [
      { createdAt: { $gte: moment(filters?.fromDate) } },
      { createdAt: { $lte: moment(filters?.toDate) } },
    ];

    oldProfileClicksQuery = {
      lawyerId,
      $and: [
        { createdAt: { $gte: oldFromDate } },
        { createdAt: { $lte: oldToDate } },
      ],
    };

    oldProfileClicksCount = await ProfileClick.findOne(
      oldProfileClicksQuery
    ).countDocuments();
  }

  profileClicksQuery.lawyerId = lawyerId;

  try {
    profileClicksCount = await ProfileClick.findOne(
      profileClicksQuery
    ).countDocuments();
  } catch (err) {
    console.log(err);
  }

  let profileClicksPercentage = 0;

  if (oldProfileClicksCount) {
    profileClicksPercentage =
      ((profileClicksCount - oldProfileClicksCount) / oldProfileClicksCount) *
      100;
  } else {
    profileClicksPercentage =
      (profileClicksCount - oldProfileClicksCount) * 100;
  }

  return {
    profileClicksCount,
    profileClicksPercentage,
  };
};

const getProviderStats = async ({ filters = {} }, { _id: userId }) => {
  if ((Object.keys(filters) && !filters?.fromDate) || !filters?.toDate) {
    filters.fromDate = moment(
      filters?.fromDate ? filters.fromDate : "1 january 1970"
    );
    filters.toDate = moment(filters?.toDate ? filters.toDate : undefined);
  }

  const query = {
    foundLawyers: {
      $in: [userId],
    },
  };

  const { allSearchesByQuery, oldSearchesByQuery } =
    await findAllSearchesByQuery(query, filters);

  const totalSearchCount = allSearchesByQuery.length;

  let searchesPercentage = 0;

  if (oldSearchesByQuery.length) {
    searchesPercentage =
      ((allSearchesByQuery.length - oldSearchesByQuery.length) /
        oldSearchesByQuery.length) *
      100;
  } else {
    searchesPercentage =
      (allSearchesByQuery.length - oldSearchesByQuery.length) * 100;
  }

  const { bookmarksCount, bookmarksPercentage } = await getBookmarksData(
    userId,
    oldSearchesByQuery,
    allSearchesByQuery
  );

  const { profileClicksCount, profileClicksPercentage } =
    await getProfileClicksData(userId, filters);

  return {
    search: {
      count: totalSearchCount,
      percentage: Math.ceil(searchesPercentage),
    },
    bookmark: {
      count: bookmarksCount,
      percentage: Math.ceil(bookmarksPercentage),
    },
    profileClick: {
      count: profileClicksCount,
      percentage: Math.ceil(profileClicksPercentage),
    },
    appointment: { count: 5, percentage: 10 },
  };
};

const updateUserProfile = async (data, { _id: userId }) => {
  if (data.workInfo && data.workInfo.length) {
    data.workInfo.map((wi) => {
      wi.business = new Types.ObjectId(wi.business);
      return wi;
    });
  }

  let user = await User.findByIdAndUpdate(
    userId,
    data,
    {
      new: true,
    }
  );

  user = getSafeUserToReturn(user);

  delete user.verificationToken;

  return user;
};

module.exports = {
  getCurrentUser,
  getProvider,
  getUserSearches,
  getProviderStats,
  updateUserProfile,
};
