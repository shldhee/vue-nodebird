const express = require("express");
const multer = require("multer");
const { isLoggedIn } = require("./middlewares");
const path = require("path");

const db = require("../models");

const router = express.Router();

router.delete("/:id", async (req, res, next) => {
  try {
    await db.Post.destory({
      where: {
        id: req.params.id
      }
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.get("/", async (req, res, next) => {
  // GET /posts?offset=10&limit=10
  try {
    const posts = await db.Post.findAll({
      include: [
        {
          model: db.User,
          attributes: ["id", "nickname"]
        },
        {
          model: db.Image
        }
      ],
      order: [["createdAt", "DESC"]],
      offset: parseInt(req.query.offset, 10) || 0,
      limit: parseInt(req.query.limit, 10) || 10
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
