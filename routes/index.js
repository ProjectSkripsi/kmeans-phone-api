const express = require("express");
const router = express.Router();
const user = require("./users");
const file = require("./uploadFile");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
router.use("/api/v1/user", user);
router.use("/api/v1/upload", file);

module.exports = router;
