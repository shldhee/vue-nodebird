exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // 다음 미들웨어로 넘어가라 인수가 없을때 인수가 있을때는 에러처리로 간다
  }
  return res.status(401).send("로그인이 필요합니다.");
};

exports.isNotLoggedIn = (req, res, next) => {
  console.log(req.isAuthenticated());
  if (!req.isAuthenticated()) {
    return next();
  }

  return res.status(401).send("로그인한 사람은 이용할 수 없습니다.");
};

// module.exports = '' 를 하게되면 위에 다 덮여쓰여진다
// module.exports = {
//   isLoggedIn: (res, res, next) => { },
//   isNotLoggedIn: (res, res, next) => { },
// }
