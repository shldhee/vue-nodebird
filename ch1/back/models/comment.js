module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
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
  Comment.associate = db => {
    // index에 db
    db.Comment.belongsTo(db.User); // UserId 추가됨
    db.Comment.belongsTo(db.Post); // PostId 추가되겠지?
  };
  return Comment;
};
