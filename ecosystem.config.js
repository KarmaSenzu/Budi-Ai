module.exports = {
  apps: [{
    name: 'chat-app',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/chat-app',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M'
  }]
}
