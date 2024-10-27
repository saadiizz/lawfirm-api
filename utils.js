const createError = require("http-errors");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcrypt");
const Stripe = require("stripe");

const { VERIFY_CODE_SOURCE, EMAIL_SUBJECTS } = require("./constants");
const { User } = require("./models");

const { EMAIL_VERIFICATION_TEMPLATE_ID, SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY)

const getEncryptedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);

  return bcrypt.hash(password, salt);
};

const getSafeUserToReturn = (user) => {
  user = JSON.parse(JSON.stringify(user));

  delete user.password;

  return user;
};

const generateToken = async (email, source) => {
  const verificationToken = Math.floor(100000 + Math.random() * 900000);

  const user = await User.findOneAndUpdate(
    {
      email,
    },
    { verificationToken: verificationToken }
  );

  if (!user) {
    throw createError(404, `No user found against this email address`);
  }

  if (source === VERIFY_CODE_SOURCE.EMAIL_VERIFICATION) {
    if (user.isEmailVerified) {
      throw createError(400, `Your email is already verified`);
    }
  }

  await sendEmail(
    email,
    EMAIL_SUBJECTS.EMAIL_VERIFICATION,
    EMAIL_VERIFICATION_TEMPLATE_ID,
    {
      verification_code: verificationToken,
    }
  );
};

const verifyToken = async ({ email, source, verificationToken }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createError(400, `Invalid code`); //doubt
  }

  if (user.isEmailVerified) {
    throw createError(400, `Your email has already been verified`); //duplicate
  }

  if (!user.verificationToken) {
    throw createError(400, `Code not generated`); //doubt
  }

  if (source === VERIFY_CODE_SOURCE.EMAIL_VERIFICATION) {
    if (user.isEmailVerified) {
      throw createError(409, `You email is already verified`);
    }
  }

  if (user.emailVerificationAttempts >= 10) {
    throw createError(403, `Account is blocked, please contact support`);
  }

  if (user.verificationToken === verificationToken) {
    // Code in valid
    const response = await User.updateOne(
      {
        email,
      },
      {
        isEmailVerified: true,
        emailVerificationAttempts: 0,
        verificationToken: null,
      }
    );
    return { response, user };
  }

  // Code in invalid
  await User.updateOne(
    { email },
    {
      emailVerificationAttempts: user.emailVerificationAttempts
        ? user.emailVerificationAttempts + 1
        : 1,
    }
  );

  throw createError(400, `"Invalid code!"`);
};

const sendEmail = (to, subject, templateId, dynamicTemplateData) => {
  return sgMail.send({
    to,
    from: "development@blockswsolutions.com",
    subject,
    // text: 'and easy to do anywhere, even with Node.js',
    // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    templateId,
    dynamicTemplateData,
  });
};

const getStripeObj = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });

module.exports = {
  getEncryptedPassword,
  getSafeUserToReturn,
  generateToken,
  verifyToken,
  getStripeObj,
};
