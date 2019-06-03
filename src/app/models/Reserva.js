module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    date: DataTypes.DATE,
    status: DataTypes.BOOLEAN
  })

  Reserva.associate = models => {
    Reserva.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' })
    Reserva.belongsTo(models.Quiosque, {
      as: 'provider',
      foreignKey: 'provider_id'
    })
  }

  return Reserva
}
