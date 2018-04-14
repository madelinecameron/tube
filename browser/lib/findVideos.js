'use strict'

const request = require('superagent')

module.exports = (self) => {
  self.addEventListener('message', (e) => {
    request('https://tube.quinzel.tech/api/search')
      .query({ term: e.data })
      .end((err, resp) => {
        if (err) {
          return
        }

        self.postMessage(resp.body)
      })
  })
}
