const { UserType } = require("../constants");
const { Category, State } = require("../models");

const findCategoryByKeywords = async (keywords) => {
  let categories = [];

  for (const keyword of keywords) {
    const category = Category.find({
      name: { $regex: new RegExp(`.*${keyword}.*`, "i") },
    }).select("-states");
    categories.push(category);
  }

  categories = await Promise.all(categories);
  categories = categories.flat();

  categories = [
    ...new Map(categories.map((item) => [item["name"], item])).values(),
  ];

  return categories;
};

const getCategories = async ({ userType }) => {
  const criteria = {};
  if (userType === UserType.BUSINESS) {
    criteria.isBusiness = true;
  }

  if (userType === UserType.INDIVIDUAL) {
    criteria.isIndividual = true;
  }

  return Category.find(criteria).select("-states");
};

const getCategoryById = async ({ categoryId }) =>
  Category.findById(categoryId).populate("states");

const createCategory = async ({
  name,
  isIndividual,
  isBusiness,
  isLocationDependent,
  states,
}) => {
  const statesArr = [];

  if (states && states.length) {
    for (const state of states) {
      const stateResponse = await State.findOne({ _id: state });
      if (stateResponse) {
        statesArr.push(state);
      }
    }
  }

  return Category.create({
    name,
    isIndividual,
    isBusiness,
    isLocationDependent,
    states,
  });
};

module.exports = {
  findCategoryByKeywords,
  getCategories,
  getCategoryById,
  createCategory,
};
