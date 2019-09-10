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
          db.Hashtag.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() }
          })
        )
      );
      await newPost.addHashtags(result.map(r => r[0]));
    }
    if (req.body.image) {
      if (Array.isArray(req.body.image)) {
        const images = await Promise.all(
          req.body.image.map(image => {
            return db.Image.create({ src: image, PostId: newPost.id });
          })
        );
      } else {
        await db.Image.create({
          src: req.body.image,
          PostId: newPost.id
        });
      }
    }
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [
        {
          model: db.User,
          attributes: ["id", "nickname"]
        },
        {
          model: db.Image
        }
      ]
    });
    return res.json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await db.Post.destory({
      where: {
        id: req.params.id
      }
    });
    res.send("삭제했습니다.");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/:id/comments", async (req, res, next) => {
  try {
    const post = await db.Post.findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    const comments = await db.Comment.findAll({
      where: {
        PostId: req.params.id
      },
      include: [
        {
          model: db.User,
          attributes: ["id", "nickname"]
        }
      ],
      order: [["createdAt", "ASC"]] // 2차원 배열!
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.post("/:id/comment", isLoggedIn, async (req, res, next) => {
  // POST /post/:id/comment
  try {
    const post = await db.Post.findOne({ where: { id: req.params.id } });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    const newComment = await db.Comment.create({
      PostId: post.id,
      UserId: req.user.id,
      content: req.body.conent
    });
    const comment = await db.Comment.findOne({
      where: {
        id: newComment.id
      },
      include: [
        {
          model: db.User,
          attributes: ["id", "nickname"]
        }
      ]
    });
    return res.json(comment);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
