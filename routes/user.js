const router = require("express").Router();

const { signup, signin } = require("../controllers/userController");
const {
  signupValidation,
  signinValidation,
} = require("../middleware/validation");

router.post("/signup", signupValidation, signup);

router.post("/signin", signinValidation, signin);

module.exports = router;
