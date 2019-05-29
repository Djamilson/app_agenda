module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    date: DataTypes.DATE
  })

  Reserva.associate = models => {
    Reserva.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' })
    Reserva.belongsTo(models.Kiosque, { as: 'kiosque', foreignKey: 'kiosque_id' })

    Reserva.belongsTo(models.User, {
      as: 'provider',
      foreignKey: 'provider_id'
    })
  }

  return Reserva
}
