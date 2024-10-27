const Cloud = require("@google-cloud/storage");
// const path = require("path");

// const serviceKey = path.join(__dirname, "./keys.json");

const { Storage } = Cloud;

// keyFilename: serviceKey,
const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

module.exports = storage;
