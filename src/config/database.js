module.exports = {
  dialect: 'postgres',
  // dialect: 'mysql'
  // host: '172.21.0.3',//localhost
  // host: '172.18.0.2', // aws
  // host: '127.0.0.1',
  host: '3.89.130.245',
  username: 'djamilson',
  password: '1alvescosta',
  database: 'gonodemodule2',
  operatorAliase: false,

  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true
  }
}
