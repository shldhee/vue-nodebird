const express = require("express");
const multer = require("multer");
const { isLoggedIn } = require("./middlewares");
const path = require("path");

const db = require("../models");

const router = express.Router();

const upload = multer({
  // 나중에 s3, google cloud 사용시 변경
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext); // icon.png, basename = icon, ext = .png
      done(null, basename + Date.now() + ext);
    }
  }),
  limit: { fileSize: 20 * 1024 * 1024 }
});

router.post("/images", isLoggedIn, upload.array("image"), (req, res) => {
  // req.files = [{ filename: 'icon20190826.png'}, { filename: 'background20190826.png'}];
  console.log(req.files);
  res.json(req.files.map(v => v.filename));
});

router.post("/", isLoggedIn, async (req, res, next) => {
  try {
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    const newPost = await db.Post.create({
      content: req.body.content,
      UserId: req.user.id
    });
    if (hashtags) {
      // 배열마다 하나씩 비동기 작업으로 Promise.all을 사용하여 await로 다 된후에 결과값 받기
      const result = await Promise.all(
        hashtags.map(tag =>
          db.Hashtags.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() }
          })
        )
      );
      await newPost.addHashtags(result.map(r => r[0]));
    }
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [
        {
          model: db.User,
          attributes: ["id", "nickname"]
        }
      ]
    });
    return res.json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
