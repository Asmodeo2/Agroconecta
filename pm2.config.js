module.exports = {
  apps: [{
    name: 'agroconecta-frontend',
    script: 'ng',
    args: 'serve --host 0.0.0.0 --port 4201 --disable-host-check',
    cwd: 'C:\\Users\\limps\\OneDrive\\Escritorio\\agroConecta\\agroconecta-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    log_file: 'C:\\Users\\limps\\OneDrive\\Escritorio\\agroConecta\\logs\\frontend.log',
    error_file: 'C:\\Users\\limps\\OneDrive\\Escritorio\\agroConecta\\logs\\frontend-error.log',
    out_file: 'C:\\Users\\limps\\OneDrive\\Escritorio\\agroConecta\\logs\\frontend-out.log',
    time: true
  }]
};