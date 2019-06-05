const crypto = require('crypto')

module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    'Token',
    {
      token: DataTypes.STRING,
      expires: DataTypes.DATE,
      status: DataTypes.BOOLEAN
    },
    {
      hooks: {
        beforeSave: async token => {
          token.token = await crypto.randomBytes(16).toString('hex')
        }
      }
    }
  )

  Token.associate = models => {
    Token.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' })
  }

  return Token
}
