const express = require("express");
const router = express.Router();
const {
  createPhone,
  deletePhone,
  updatePhone,
  getPhones,
} = require("../controllers/phoneController");
const { isLogin } = require("../middlewares/auth");

router.post("/", isLogin, createPhone);
router.get("/:pageSize/:currentPage", getPhones);
router.delete("/:_id", isLogin, deletePhone);
router.put("/:_id", isLogin, updatePhone);

module.exports = router;
