module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      content: {
        type: DataTypes.TEXT, // 매우 긴 텍스트
        allowNull: false
      } // createdAt, updatedAt 자동생성
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci"
    }
  );
  Post.associate = db => {
    db.Post.belongsTo(db.User); // UserId 추가됨 사람을 통해 게시글 불러옴
    db.Post.hasMany(db.Comment); // hasMany는 생성안해준다. 대신 디비에서 A라는 사람이 쓴글 가져와라~ 알아내~ 이때 사용한다. 양방향 게시글을 통해 댓글을 불러옴
    db.Post.hasMany(db.Image);
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
  };
  return Post;
};
