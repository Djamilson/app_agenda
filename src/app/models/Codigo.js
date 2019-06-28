module.exports = (sequelize, DataTypes) => {
  const Codigo = sequelize.define('Codigo', {
    codigo_interno: DataTypes.STRING,
    nome: DataTypes.STRING
  })

  return Codigo
}
