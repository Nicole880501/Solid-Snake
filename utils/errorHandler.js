exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Oops! Something went wrong!')
}

exports.socketErrorHandler = (server) => {
  server.on('error', (err) => {
    console.error('Socket server error', err)
  })
}
