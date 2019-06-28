const server = require('./server')
const { port } = require('./config/config')

server.listen(port || 3000, () => {
  // const ip = require('ip')
  // console.log(ip.address())
  // console.log('Started at http://localhost:%d', port)
})
