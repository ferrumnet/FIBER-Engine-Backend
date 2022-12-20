module.exports = {
  http200: function (data: any) {
    let message = data.message
    let key = data.phraseKey
    delete data.message
    delete data.phraseKey
    return this.json({
      status: {
        code: 200,
        message: message || 'Success',
        phraseKey: key || ''
      },
      body: data
    })
  },

  http400: function (err: any,key='') {

    return this.status(400).send({
      status: {
        code: 400,
        message: err,
        phraseKey: key
      }
    })
  },

  http401: function (err: any) {

    return this.status(401).send({
      status: {
        code: 401,
        message: err
      }
    })
  },

  http404: function (err: any, key='') {

    return this.status(404).send({
      status: {
        code: 404,
        message: err,
        phraseKey: key
      }
    })
  }

}
