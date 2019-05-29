module.exports = (sequelize, DataTypes) => {
  const Kiosque = sequelize.define(
    'Kiosque',
    {
      name: DataTypes.STRING,
      informacao: DataTypes.STRING,
      avatar: DataTypes.STRING,
      provider: DataTypes.BOOLEAN
    }
  )

  return Kiosque
}
