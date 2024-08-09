require("dotenv").config();

const auth = {
  type: "oauth2",
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  refreshToken: process.env.REFRESH_TOKEN,
};

module.exports = auth;
