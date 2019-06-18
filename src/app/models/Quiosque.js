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
      foreignKey: 'provider_id'
    })
  }

  return Quiosque
}
