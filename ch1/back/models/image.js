// 이미지 저장용 서버에 저장하고 그 주소를 디비에다 저장
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    "Image", {
      src: {
        type: DataTypes.STRING(2000),
        allowNull: false
      }
    }, {
      charset: "utf8",
      collate: "utf8_general_ci" // 한글저장됩니다
    }
  );
  Image.associate = db => {
    db.Image.belongsTo(db.Post);
  };
  return Image;
};