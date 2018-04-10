const fs = require('fs')
const https = require('https')
const http = require('http')
const app = require('./app')

if (process.env.ENV === 'production') {
  https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/areyouhappytoday.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/areyouhappytoday.com/cert.pem')
  }, app).listen(3000, function(){
    console.log("Express server listening on port 3000, ENV=production")
  })
} else {
  http.createServer(app).listen(3000, function() {
    console.log("Express server listening on port 3000, ENV=staging")
  })
}