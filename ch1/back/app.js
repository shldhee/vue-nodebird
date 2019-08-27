const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./models");
const app = express();

db.sequelize.sync();

app.use(cors("http://localhost:3000"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("안녕 백엔드");
});

app.post("/user", async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 12); // 암호화 패스워드
    const exUser = db.User.findOne({
      email: req.body.email
    }); // 이메일 체크
    if (exUser) {
      // 회원가입이되어있으면
      return req.status(403).json({
        errorCode: 1, // 에러코드 정의
        message: "이미 회원가입되어있습니다."
      });
    }
    const newUser = await db.User.create({
      email: req.body.email,
      password: hash,
      nickname: req.body.nickname
    });
    return res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

app.listen(3085, () => {
  console.log(`백엔드 서버 ${3085}번 포트에서 작동중`);
});
