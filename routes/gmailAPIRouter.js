const express = require("express");
const router = express.Router();
const APIController = require("../controllers/gmailAPIController");

router.get("/", (req, res) => {
  res.send("Test Gmail API");
});

router.get("/profile", APIController.getProfile);
router.get("/drafts", APIController.getDrafts);
router.get("/mails", APIController.getMails);
router.post("/watch", APIController.watch);
router.post("/notifications", APIController.notifications);

module.exports = router;
