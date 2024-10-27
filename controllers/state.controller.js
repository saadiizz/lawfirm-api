const { State } = require("../models");

const createState = ({ name, code }) => State.create({ name, code });

const getStates = () => State.find();

module.exports = {
  createState,
  getStates,
};
