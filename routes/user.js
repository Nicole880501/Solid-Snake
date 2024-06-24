const router = require('express').Router()

const {
  signup,
  signin,
  googleSignin,
  googleCallback,
  getUserLevel
} = require('../controllers/userController')
const {
  signupValidation,
  signinValidation
} = require('../middleware/validation')

router.post('/signup', signupValidation, signup)

router.post('/signin', signinValidation, signin)

router.get('/google', googleSignin)

router.get('/google/callback', googleCallback)

router.get('/level', getUserLevel)

module.exports = router
