const axios = require("axios");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const auth = require("../constant");
require("dotenv").config();
const { createConfig } = require("../utils");

const oAuth2Client = new google.auth.OAuth2(
  auth.clientId,
  auth.clientSecret,
  auth.redirectUri
);

oAuth2Client.setCredentials({ refresh_token: auth.refreshToken });

async function getMails(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=100`;
    const { token } = await oAuth2Client.getAccessToken();
    console.log(token);
    const config = createConfig(url, token);
    //console.log(config);
    const response = await axios(config);

    res.json(response.data);
  } catch (error) {
    //console.log(error);
    res.send(error);
  }
}

//
async function getProfile(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/profile`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = createConfig(url, token);
    const response = await axios(config);
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function watch(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/watch`;
    const { token } = await oAuth2Client.getAccessToken();
    const requestBody = {
      topicName: "projects/gmail-api-test-432003/topics/gmail-api-noti",
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
    });
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function getDrafts(req, res) {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/drafts`;
    const { token } = await oAuth2Client.getAccessToken();
    const config = createConfig(url, token);
    const response = await axios(config);
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function notifications(req, res) {
  try {
    const pubSubMessage = req.body.message;

    if (pubSubMessage && pubSubMessage.data) {
      // Decode the base64-encoded message data
      const messageData = Buffer.from(pubSubMessage.data, "base64").toString(
        "utf-8"
      );
      const parsedData = JSON.parse(messageData);

      console.log("Received Pub/Sub message:", parsedData);

      // Get the historyId from the message
      const { emailAddress, historyId } = parsedData;

      // Get the history from the Gmail API
      const url = `https://gmail.googleapis.com/gmail/v1/users/${emailAddress}/history?startHistoryId=${historyId}`;
      const { token } = await oAuth2Client.getAccessToken();
      const config = createConfig(url, token);
      const response = await axios(config);
      const history = response.data.history;
      console.log("History:", history);

      // Get the messages from the history
      const messages = history.filter((record) => record.messages);
      console.log("Messages:", messages);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing notification:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { getMails, getProfile, getDrafts, watch, notifications };
