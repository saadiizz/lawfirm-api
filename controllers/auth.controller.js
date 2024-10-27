const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const bcrypt = require("bcrypt");

const { VERIFY_CODE_SOURCE } = require("../constants");
const { User } = require("../models");
const {
  getEncryptedPassword,
  getSafeUserToReturn,
  generateToken,
  verifyToken,
} = require("../utils");
const { auth } = require("../middlewares");

const register = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  workInfo,
  userType,
}) => {
  try {
    if (email) {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw createError(400, `Email already exists!`);
      }
    }

    password = await getEncryptedPassword(password);

    let user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      workInfo,
      userType,
    });

    // await generateToken(user.email, VERIFY_CODE_SOURCE.EMAIL_VERIFICATION);

    return getSafeUserToReturn(user);
  } catch (err) {
    throw createError(err);
  }
};

const login = async ({ email, password }) => {
  let user = await User.findOne({ email }).select(
    "-addresses -practiceAreas -experiences -businesses -billingStructure -languages"
  );

  if (!user) {
    throw createError(404, `Email not found!`);
  }

  const result = await bcrypt.compare(password, user.password);

  if (!result) {
    throw createError(401, `Password Incorrect!`);
  }

  // let accessToken = null;

  // if (user.isEmailVerified) {
  //   const payload = {
  //     email: user.email,
  //     sub: user._id,
  //     userType: user.userType,
  //   };

  //   accessToken = jwt.sign(payload);
  // }

  return getSafeUserToReturn(user);

  // delete user.verificationToken;

  // return {
  //   accessToken,
  //   user,
  // };
};

const sendEmailCode = ({ email, source }) => generateToken(email, source);

const verifyEmailCode = async ({ email, source, verificationToken }) => {
  const paymentController = require("./payment.controller");

  const { user } = await verifyToken({ email, source, verificationToken }); //unused response

  const accessToken = auth.createToken({ _id: user._id });

  return {
    accessToken,
    stripeCustomerId: await paymentController.getStripeCustomerId(
      user._id.toString()
    ),
  };
};

const updatePassword = async ({ password }, { _id: userId }) => {
  password = await getEncryptedPassword(password);

  return User.findByIdAndUpdate(userId, { password });
};

module.exports = {
  register,
  login,
  sendEmailCode,
  verifyEmailCode,
  updatePassword,
};
