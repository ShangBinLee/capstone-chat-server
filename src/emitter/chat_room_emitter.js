const getChatRoomsEmitter = (socket, chatRooms) => {
  socket.emit('get_chat_rooms', chatRooms);
};