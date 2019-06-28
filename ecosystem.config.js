module.exports = {
  apps: [
    {
      name: 'app_agenda',
      script: './src/index.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
