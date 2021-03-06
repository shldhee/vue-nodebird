const express = require("express");
const multer = require("multer");
const path = require("path");
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const db = require("../models");
const {
  isLoggedIn
} = require("./middlewares");

const router = express.Router();

AWS.config.update({
  region: 'ap-northeast-2',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
})

const upload = multer({
  // 나중에 s3, google cloud 사용시 변경
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'vue-dokibird',
    key(req, file, cb) {
      cb(null, `original/${Date.now()}${path.basename(file.originalname)}`)
    },
  }),
  limit: {
    fileSize: 20 * 1024 * 1024
  }
});

console.log(upload, "upload!!!!");
router.post("/images", isLoggedIn, upload.array("image"), (req, res) => {
  console.log("hoithoit");
  // req.files = [{ filename: 'icon20190826.png'}, { filename: 'background20190826.png'}];
  res.json(req.files.map(v => v.location));
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
            where: {
              name: tag.slice(1).toLowerCase()
            }
          })
        )
      );
      await newPost.addHashtags(result.map(r => r[0]));
    }
    if (req.body.image) {
      if (Array.isArray(req.body.image)) {
        // 배열인지 아닌지 구분코드 1개있을때 문자열로 가끔 체크함
        const images = await Promise.all(
          req.body.image.map(image => {
            return db.Image.create({
              src: image,
              PostId: newPost.id
            });
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
      where: {
        id: newPost.id
      },
      include: [{
          model: db.User,
          attributes: ["id", "nickname"]
        },
        {
          model: db.Image
        },
        {
          model: db.User,
          as: "Likers",
          attributes: ["id"]
        }
      ]
    });
    return res.json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: {
        id: req.params.id
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
      }, {
        model: db.User,
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: db.Post,
        as: 'Retweet',
        include: [{
          model: db.User,
          attributes: ['id', 'nickname'],
        }, {
          model: db.Image,
        }],
      }],
    });
    res.json(post);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await db.Post.destroy({
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
    const post = await db.Post.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    const comments = await db.Comment.findAll({
      where: {
        PostId: req.params.id
      },
      include: [{
        model: db.User,
        attributes: ["id", "nickname"]
      }],
      order: [
        ["createdAt", "ASC"]
      ] // 2차원 배열!
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
    const post = await db.Post.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    const newComment = await db.Comment.create({
      PostId: post.id,
      UserId: req.user.id,
      content: req.body.content
    });
    const comment = await db.Comment.findOne({
      where: {
        id: newComment.id
      },
      include: [{
        model: db.User,
        attributes: ["id", "nickname"]
      }]
    });
    return res.json(comment);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/:id/retweet", isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: {
        id: req.params.id
      },
      include: [{
        model: db.Post,
        as: "Retweet" // 리트윗한 게시글이면 원본 게시글이 됨
      }]
    });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    if (
      req.user.id === post.UserId ||
      (post.Retweet && post.Retweet.UserId === req.user.id)
    ) {
      return res.status(403).send("자신의 글은 리트윗할 수 없습니다.");
    }
    const retweetTargetId = post.RetweetId || post.id;
    const exPost = await db.Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId
      }
    });
    if (exPost) {
      return res.status(403).send("이미 리트윗했습니다.");
    }
    const retweet = await db.Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId, // 원본 아이디
      content: "retweet"
    });
    const retweetWithPrevPost = await db.Post.findOne({
      where: {
        id: retweet.id
      },
      include: [{
          model: db.User,
          attributes: ["id", "nickname"]
        },
        {
          model: db.User,
          as: "Likers",
          attributes: ["id"]
        },
        {
          model: db.Post,
          as: "Retweet",
          include: [{
              model: db.User,
              attributes: ["id", "nickname"]
            },
            {
              model: db.Image
            }
          ]
        }
      ]
    });
    res.json(retweetWithPrevPost);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/:id/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    await post.addLiker(req.user.id);
    res.json({
      userId: req.user.id
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.delete("/:id/like", isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!post) {
      return res.status(404).send("포스트가 존재하지 않습니다.");
    }
    await post.removeLiker(req.user.id);
    res.json({
      userId: req.user.id
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;