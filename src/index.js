const server = require('./server')
const { port } = require('./config/config')

server.listen(port || 3333)
