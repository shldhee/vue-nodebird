const passport = require("passport");
const local = require("./local");
const db = require("../models");

module.exports = () => {
  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });
  // 로그인 후 모든 요청에 대해 deserializeUser 실행
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.User.findOne({ where: { id } });
      return done(null, user);
    } catch (error) {
      console.error(error);
      return done(err);
    }
  });
  local();
};
