export default (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { as: 'sender' });
    Message.belongsTo(models.Request);
  };

  return Message;
};
