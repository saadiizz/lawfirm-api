const createError = require("http-errors");

const { User, Search } = require("../models");
const { SEARCH_STATUS } = require("../constants");

const findSearchLastCount = async () => {
  const allSearchesCount = await Search.count();

  if (!allSearchesCount) {
    const count = 0;
    return count;
  }

  return allSearchesCount;
};

const findSearchByQuery = async (query, popQuery) => {
  const searchesById = await Search.findOne(query).populate(popQuery);

  if (!searchesById) {
    return false;
  }

  return searchesById;
};

const createSearch = async (data) => {
  try {
    const lastSearchProfileId = await findSearchLastCount();
    const id = lastSearchProfileId + 1;
    data.id = id;

    const createdSearch = await Search.create(data);

    if (!createdSearch) {
      return false;
    }

    return createdSearch;
  } catch (error) {
    return error;
  }
};

const searchByCategoryAndState = async (
  { search: searchId, category: categoryId, state: stateId, pageNo, limit },
  { _id: userId }
) => {
  const defaultLimit = limit || 10;
  const page = pageNo || 1;
  const offset = (page - 1) * defaultLimit;
  let profiles;
  let totalPages = 0;
  let totalItems = 0;
  let search_id;
  const query = {};

  if (stateId) {
    query["locationPermitted"] = stateId;
  }

  if (!searchId) {
    query.practiceAreas = categoryId;
    profiles = await User.find(query).lean();
    totalItems = await User.find(query).countDocuments();

    const lawyersIdSearched = profiles.map((p) => {
      return p._id;
    });

    const createdSearch = await createSearch({
      foundLawyers: lawyersIdSearched,
      category: categoryId,
      user: userId,
    });

    if (!createdSearch) {
      throw createError(404, `searches Not Found!`);
    }

    search_id = createdSearch._id;
  } else {
    query._id = searchId;

    const populateQuery = {
      path: "foundLawyers",
      select: "-_v -password -verificationToken",
    };

    const profilesBySearchId = await findSearchByQuery(query, populateQuery);

    if (!profilesBySearchId) {
      throw createError(404, `searches Not Found!`);
    }

    totalItems = profilesBySearchId.foundLawyers.length;
    profiles = profilesBySearchId.foundLawyers;
    search_id = searchId;
  }

  totalPages = Math.ceil(totalItems / defaultLimit);

  // just for testing purposes, we need to implement proper logic for it
  profiles = profiles.map((p) => {
    p["matchPercentage"] = 98;
    delete p.password;
    delete p.verificationToken;
    return p;
  });

  const startIndex = offset;
  const endIndex = startIndex + defaultLimit;

  const paginatedProfiles = profiles.slice(startIndex, endIndex);

  return {
    searchId: search_id,
    providers: paginatedProfiles,
    totalPages,
    currentPage: page,
    itemsPerPage: defaultLimit,
    totalItems,
  };
};

const smartSearch = async (
  { searchId, text, limit, page: pageNo },
  { _id: userId }
) => {
  const categoryController = require("./category.controller");

  const defaultLimit = limit || 10;
  const page = pageNo || 1;
  const offset = (page - 1) * defaultLimit;
  let search_id;
  let profiles;

  const query = {};

  let totalPages = 0;
  let totalItems = 0;

  if (!searchId) {
    const keywords = text.split(" ").filter((e) => e.length >= 3);

    const categories = await categoryController.findCategoryByKeywords(
      keywords
    );

    const categoryIds = categories.map((category) => {
      return category._id;
    });

    profiles = await User.find({ practiceAreas: { $in: categoryIds } }).lean();

    totalItems = await User.find({
      practiceAreas: { $in: categoryIds },
    }).countDocuments();

    const lawyersIdSearched = profiles.map((p) => {
      return p._id;
    });

    const createdSearch = await createSearch({
      foundLawyers: lawyersIdSearched,
      text,
      user: userId,
    });

    if (!createdSearch) {
      throw createError(404, `searches Not Found!`);
    }

    search_id = createdSearch._id;
  } else {
    query._id = searchId;

    const populateQuery = {
      path: "foundLawyers",
      select: "-_v -password -verificationToken",
    };

    const profilesBySearchId = await findSearchByQuery(query, populateQuery);

    if (!profilesBySearchId) {
      throw createError(404, `searches Not Found!`);
    }

    totalItems = profilesBySearchId.foundLawyers.length;
    profiles = profilesBySearchId.foundLawyers;

    search_id = searchId;
  }

  totalPages = Math.ceil(totalItems / defaultLimit);
  profiles = profiles.map((p) => {
    p["matchPercentage"] = 98;
    delete p.password;
    delete p.verificationToken;
    return p;
  });

  const startIndex = offset;
  const endIndex = startIndex + defaultLimit;

  const paginatedProfiles = profiles.slice(startIndex, endIndex);

  return {
    searchId: search_id,
    providers: paginatedProfiles,
    totalPages,
    currentPage: page,
    itemsPerPage: defaultLimit,
    totalItems,
  };
};

const getSearchById = ({ searchId }) => Search.findById(searchId);

const deleteSearchById = async ({ searchId }, { _id: userId }) => {
  const deletedSearch = await Search.findOneAndUpdate(
    { _id: searchId, user: userId },
    { status: SEARCH_STATUS.DELETED }
  );

  if (!deletedSearch) {
    throw createError(400, { message: `Invalid search ID!`, data: {} });
  }
};

const updateSearchById = async (id, query) => {
  const updatedSearch = await Search.findByIdAndUpdate(id, query, { new: true });

  if (!updatedSearch) {
    return false;
  }
  return updatedSearch;
};

const addBookMark = async ({ searchId }, { providerId }, { _id: userId }) => {
  const query = {
    $and: [
      {
        _id: searchId,
      },
      {
        user: userId,
      },
    ],
  };

  const searchesById = await findSearchByQuery(query, null);

  if (!searchesById) {
    throw createError(404, `Invalid Search Id!`);
  }

  const alreadyBookmarked = searchesById.bookmarkedLawyers;

  const bookMarkedExist = alreadyBookmarked.includes(providerId);

  if (!bookMarkedExist) {
    alreadyBookmarked.push(providerId);
  }

  const update = {
    bookmarkedLawyers: alreadyBookmarked,
  };

  const updatedSearchDocument = await updateSearchById(searchId, update);

  if (!updatedSearchDocument) {
    throw createError(404, `Bookmarked unsuccessful`);
  }

  return updatedSearchDocument;
};

const deleteBookmark = async (
  { providerId },
  { searchId },
  { _id: userId }
) => {
  const query = {
    $and: [
      {
        _id: searchId,
      },
      {
        user: userId,
      },
    ],
  };

  const searchesById = await findSearchByQuery(query, null);

  if (!searchesById) {
    throw createError(404, `Invalid Search Id!`);
  }

  const alreadyBookmarked = searchesById.bookmarkedLawyers;

  const index = alreadyBookmarked.indexOf(providerId);

  if (index > -1) {
    alreadyBookmarked.splice(index, 1);
    alreadyBookmarked;
  }

  const update = {
    bookmarkedLawyers: alreadyBookmarked,
  };

  const updatedSearchDocument = await updateSearchById(searchId, update);

  if (!updatedSearchDocument) {
    throw createError(400, `Bookmarked deletion unsuccessful!`);
  }

  return updatedSearchDocument;
};

module.exports = {
  searchByCategoryAndState,
  smartSearch,
  getSearchById,
  deleteSearchById,
  addBookMark,
  deleteBookmark,
};
