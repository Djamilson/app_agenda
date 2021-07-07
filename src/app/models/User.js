const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      avatar: DataTypes.STRING,
      password: DataTypes.VIRTUAL,
      password_hash: DataTypes.STRING,
      provider: DataTypes.BOOLEAN,
      is_verified: DataTypes.BOOLEAN,
      status: DataTypes.BOOLEAN
    },
    {
      hooks: {
        beforeSave: async user => {
          if (user.password) {
            user.password_hash = await bcrypt.hash(user.password, 8)
          }
        }
      }
    }
  )

  User.associate = models => {
    User.hasOne(models.Token, {
      as: 'token',
      foreignKey: 'user_id',
      foreignKeyConstraint: true
    })
    User.belongsTo(models.Codigo, {
      as: 'codigo',
      foreignKey: 'codigo_interno'
    })
  }

  // metodos personalizados para o usuário
  User.prototype.checkPassword = function (password) {
    return bcrypt.compare(password, this.password_hash)
  }

  return User
}
