const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const { createUser, getUser, getUserByEmail } = require('../models/user')

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.HOST}/user/google/callback`
})

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const hashPassword = await bcrypt.hash(password, 10)

    const userData = {
      name,
      email,
      password: hashPassword,
      provider: 'native',
      thumbnail: null
    }

    const existingUser = await getUser(name)
    if (existingUser) {
      res.status(403).json({ error: 'Player name or email have been signup' })
      return
    }

    const userId = await createUser(userData)

    const EXPIRE_TIME = 600 * 600
    const token = jwt.sign({ name: userData.name }, process.env.JWT_KEY, {
      expiresIn: EXPIRE_TIME
    })

    res
      .cookie('access_token', token)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: EXPIRE_TIME,
          user: {
            id: userId.insertId,
            name: userData.name,
            email: userData.email
          }
        }
      })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'sign up failed' })
  }
}

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body
    const existingUser = await getUserByEmail(email)
    if (!existingUser) {
      res.status(401).json({ error: 'email not found, plz check email' })
    }

    const validPassword = await bcrypt.compare(password, existingUser.password)

    if (!validPassword) {
      res.status(403).json({ error: 'email or password incorrect' })
    }

    const EXPIRE_TIME = 600 * 600
    const token = jwt.sign({ name: existingUser.name }, process.env.JWT_KEY, {
      expiresIn: EXPIRE_TIME
    })

    res
      .cookie('access_token', token)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: EXPIRE_TIME,
          user: {
            ...existingUser
          }
        }
      })
  } catch (error) {
    res.status(500).json({ error: 'sign in failed' })
  }
}

exports.googleSignin = (req, res) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  })
  res.redirect(authorizeUrl)
}

exports.googleCallback = async (req, res) => {
  const { code } = req.query

  try {
    // 用授權碼換取 token
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // 透過 Google API 取得用戶資訊
    const userInfo = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    })

    const userData = {
      name: userInfo.data.name,
      email: userInfo.data.email,
      password: null,
      provider: 'google',
      thumbnail: userInfo.data.picture
    }

    const existingUser = await getUserByEmail(userInfo.data.email)
    if (existingUser) {
      if (existingUser.provider === 'native') {
        res.status(403).json({ error: '此信箱已在本地註冊過' })
      } else {
        const EXPIRE_TIME = 600 * 600
        const token = jwt.sign({ name: userData.name }, process.env.JWT_KEY, {
          expiresIn: EXPIRE_TIME
        })

        res.cookie('access_token', token).status(200).redirect('/game') // 跳轉回前端頁面
      }
      return
    }

    await createUser(userData)
    console.log('已儲存新google用戶')

    const EXPIRE_TIME = 60 * 60
    const token = jwt.sign({ name: userData.name }, process.env.JWT_KEY, {
      expiresIn: EXPIRE_TIME
    })

    res.cookie('access_token', token).status(200).redirect('/game') // 跳轉回前端頁面
  } catch (error) {
    console.error(error)
    res.status(400).send('Error fetching Google user info')
  }
}

exports.getUserLevel = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const username = decoded.name

    const userRecord = await getUser(username)

    if (userRecord) {
      res.status(200).json(userRecord)
    } else {
      res.status(404).json({ message: 'player not found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
