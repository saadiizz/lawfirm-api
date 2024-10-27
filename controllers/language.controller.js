const { Language } = require("../models");

const getLanguages = () => Language.find();

const createLanguage = ({ name }) => Language.create({ name });

module.exports = {
  createLanguage,
  getLanguages,
};
