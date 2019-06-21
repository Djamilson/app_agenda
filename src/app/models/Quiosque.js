module.exports = (sequelize, DataTypes) => {
  const Quiosque = sequelize.define('Quiosque', {
    name: DataTypes.STRING,
    complemento: DataTypes.STRING,
    avatar: DataTypes.STRING,
    provider: DataTypes.BOOLEAN
  })

  Quiosque.associate = models => {
    Quiosque.hasMany(models.Reserva, {
      as: 'reserva',
      foreignKey: 'quiosque_id',
      foreignKeyConstraint: false
    })
  }

  return Quiosque
}
