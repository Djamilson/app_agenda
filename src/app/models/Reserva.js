module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    date: DataTypes.DATE,
    status: DataTypes.BOOLEAN,
    statusdeuso: DataTypes.BOOLEAN,
    horadareserva: DataTypes.STRING
  })

  Reserva.associate = models => {
    Reserva.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' })
    Reserva.belongsTo(models.Quiosque, {
      as: 'quiosque',
      foreignKey: 'quiosque_id'
    })

    /*
Reserva.hasMany(models.Quiosque, {
      as: 'quiosque',
      foreignKey: 'id'
    })
    */
  }

  return Reserva
}
