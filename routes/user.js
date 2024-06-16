const router = require("express").Router();

const {
  signup,
  signin,
  googleSignin,
  googleCallback,
} = require("../controllers/userController");
const {
  signupValidation,
  signinValidation,
} = require("../middleware/validation");

router.post("/signup", signupValidation, signup);

router.post("/signin", signinValidation, signin);

router.get("/google", googleSignin);

router.get("/google/callback", googleCallback);

module.exports = router;
