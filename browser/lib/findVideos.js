'use strict'

const request = require('superagent')

module.exports = (self) => {
  self.addEventListener('message', (e) => {
    const data = JSON.parse(e.data)
    request('https://tube.qnzl.co/api/search')
      .query({ term: data.term, pageToken: data.token })
      .end((err, resp) => {
        if (err) {
          return
        }

        self.postMessage(resp.body)
      })
  })
}
