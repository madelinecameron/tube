const fs = require('fs')
const https = require('https')
const http = require('http')
const app = require('./app')

if (process.env.ENV === 'production') {
  https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/tube.qznl.co/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/tube.qnzl.co/cert.pem')
  }, app).listen(3003, function(){
    console.log("Express server listening on port 3003, ENV=production")
  })
} else {
  http.createServer(app).listen(3003, function() {
    console.log("Express server listening on port 3003, ENV=staging")
  })
}