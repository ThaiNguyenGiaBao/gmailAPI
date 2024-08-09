const axios = require("axios");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const auth = require("../constant");
require("dotenv").config();
const { createConfig } = require("../utils");
const gmail = google.gmail("v1");

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
      // Fetch the history list using the historyId
      const gmailResponse = await gmail.users.history.list({
        userId: "me",
        startHistoryId: historyId,
      });
      const history = gmailResponse.data.history || [];
      console.log("History:", history);
      for (const record of history) {
        if (record.messagesAdded) {
          for (const msg of record.messagesAdded) {
            const messageId = msg.message.id;

            // Fetch the full message using the messageId
            const messageResponse = await gmail.users.messages.get({
              userId: "me",
              id: messageId,
            });

            const message = messageResponse.data;

            console.log("Full message data:", message);

            // Extract and log the email content (subject, body, etc.)
            const subjectHeader = message.payload.headers.find(
              (header) => header.name === "Subject"
            );
            const subject = subjectHeader ? subjectHeader.value : "No Subject";

            // The message body might be in different parts (plain text or HTML)
            let body = "";
            if (message.payload.parts) {
              body = message.payload.parts
                .map((part) => part.body.data)
                .join("");
            } else {
              body = message.payload.body.data;
            }

            // Decode the base64url-encoded body
            const decodedBody = Buffer.from(body, "base64url").toString(
              "utf-8"
            );

            console.log("Subject:", subject);
            console.log("Body:", decodedBody);

            // Here you can process the message content as needed
          }
        }
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing notification:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { getMails, getProfile, getDrafts, watch, notifications };
