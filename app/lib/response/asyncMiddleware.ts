const asyncMiddlewareLayer = (fn: (req: any, res: any, next: any) => any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next))
    .catch(err => {
      try{

        if (err.message) {
          err = err.message
        } else if (err.msg) {
          err = err.msg
        }else if(err && err.errors && err.errors.type && err.errors.type.properties  && err.errors.type.properties.message){
          err = err.errors.type.properties.message
        } else if (err.errors) {
          err.forEach(err.errors, (error: any, key: any) => {
            error.push(error.message)
         })
            err = err[0]
        }

        res.http400(err)
      }catch(e){
        res.http400(e)
      }
    })
}

module.exports = asyncMiddlewareLayer
