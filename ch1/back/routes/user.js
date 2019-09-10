const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const db = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const router = express.Router();

router.get("/", isLoggedIn, async (req, res, next) => {
  const user = req.user;
  res.json(user);
});
router.post("/", isNotLoggedIn, async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 12); // 암호화 패스워드
    const exUser = await db.User.findOne({
      where: {
        email: req.body.email
      }
    }); // 이메일 체크
    if (exUser) {
      // 회원가입이되어있으면
      return res.status(403).json({
        errorCode: 1, // 에러코드 정의
        message: "이미 회원가입되어있습니다."
      });
    }

    await db.User.create({
      email: req.body.email,
      password: hash,
      nickname: req.body.nickname
    });
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      if (info) {
        return res.status(401).send(info.reason);
      }
      return req.login(user, async err => {
        // 세션에다 사용자 정보 저장 어떻게 저장? serializeUser로 저장~
        if (err) {
          console.error(err);
          return next(err);
        }
        return res.json(user);
      });
    })(req, res, next); // localStragey 실행
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  console.log(req);
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async err => {
      // 세션에다 사용자 정보 저장 어떻게 저장? serializeUser로 저장~
      if (err) {
        console.error(err);
        return next(err);
      }
      return res.json(user);
    });
  })(req, res, next); // localStragey 실행
});

router.post("/logout", isLoggedIn, (req, res, next) => {
  if (req.isAuthenticated) {
    req.logout(); // 필수
    req.session.destroy(); // 선택사항
    return res.status(200).send("로그아웃이 되었습니다.");
  }
});

module.exports = router;
