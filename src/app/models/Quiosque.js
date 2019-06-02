module.exports = (sequelize, DataTypes) => {
  const Quiosque = sequelize.define('Quiosque', {
    name: DataTypes.STRING,
    complemento: DataTypes.STRING,
    avatar: DataTypes.STRING,
    provider: DataTypes.BOOLEAN
  })

  return Quiosque
}
