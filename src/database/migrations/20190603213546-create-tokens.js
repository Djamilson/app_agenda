'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('tokens', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        token: { allowNull: false, type: Sequelize.STRING },
        user_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: false
        },
        expires: {
          allowNull: false,
          type: Sequelize.DATE
        },
        status: {
          allowNull: false,
          defaultValue: false,
          type: Sequelize.BOOLEAN
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .then(() => {
        console.log('created VerificationToken table')
        return queryInterface.sequelize.query(`
        CREATE EVENT expireToken
        ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL  1 DAY
        DO
        DELETE FROM tokens WHERE createdAt < DATE_SUB(NOW(), INTERVAL 1 DAY);
        `)
      })
      .then(() => {
        console.log('expireToken event created')
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .dropTable('tokens')
      .then(() => {
        console.log('tokens table dropped')
        return queryInterface.sequelize.query(
          `DROP EVENT IF EXISTS  expireToken`
        )
      })
      .then(() => {
        console.log('expireToken event dropped')
      })
  }
}
