module.exports = {
  apps: [{
    name: 'chat-server',
    script: 'server.js',
    watch: true,
    ignore_watch: ['node_modules', 'logs'],
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
}; 