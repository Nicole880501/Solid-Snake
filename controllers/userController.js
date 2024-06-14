const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, getUser, getUserByEmail } = require("../models/user");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashPassword,
      provider: "native",
      thumbnail: null,
    };

    const existingUser = await await getUser(name);
    if (existingUser) {
      res.status(403).json({ error: "玩家名已存在" });
      return;
    }

    const userId = await createUser(userData);

    const EXPIRE_TIME = 60 * 60;
    const token = jwt.sign({ name: userData.name }, process.env.JWT_KEY, {
      expiresIn: EXPIRE_TIME,
    });

    res.status(200).json({
      data: {
        access_token: token,
        access_expired: EXPIRE_TIME,
        user: {
          id: userId.insertId,
          name: userData.name,
          email: userData.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "sign up failed" });
  }
};
