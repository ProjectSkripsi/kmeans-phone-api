const express = require("express");
const router = express.Router();
const {
  createPhone,
  deletePhone,
  updatePhone,
  getPhones,
  getPhoneById,
} = require("../controllers/phoneController");
const { isLogin } = require("../middlewares/auth");

router.post("/", isLogin, createPhone);
router.get("/:pageSize/:currentPage", getPhones);
router.post("/delete", isLogin, deletePhone);
router.put("/:_id", isLogin, updatePhone);
router.get("/:_id", getPhoneById);

module.exports = router;
