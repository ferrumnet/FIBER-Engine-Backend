module.exports = function () {
  const values: any = {};

  // TODO: Define token field
  var token = '';

  // TODO: Add event type
  values.EVENT_TYPE = 'FIBER Engine';

  // TODO: Define message types
  values.MESSAGE_TYPE = {};

  values.newConnection = function(socket: any) {
    (global as any).log.info('handshake request from ', socket.handshake.query[token], ' socket id', socket.id);

    if (!socket.handshake.query[token]) {
      (global as any).log.info('disconnecting user because of no token');
      socket.disconnect();
    } else {

    }

  };


  values.send = function(chatId: any, type: any, message: any) {
    // TODO: implement socket send message
  };

  return values;
}