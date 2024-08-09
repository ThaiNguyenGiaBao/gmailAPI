const express = require("express");
require("dotenv").config();
const gmailAPIRouter = require("./routes/gmailAPIRouter");

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Gmail APIs with nodejs");
});

app.use("/api", gmailAPIRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
