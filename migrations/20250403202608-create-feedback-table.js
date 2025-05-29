module.exports = {
  async up(queryInterface, Sequelize) {
await queryInterface.createTable("Feedbacks", {
  feedback_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  request_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  rating: {
    type: Sequelize.SMALLINT,  // Changed from TINYINT to SMALLINT
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  comments: {
    type: Sequelize.STRING(500),
  },
  submitted_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});
},

async down(queryInterface, Sequelize) {
await queryInterface.dropTable("Feedbacks");
},
};
