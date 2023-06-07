const getChatRoomsEmitter = (socket, chatRooms) => {
  socket.emit('get_chat_rooms', chatRooms);
};

const notificateNewChatRoomEmitter = (socket, rooms, msg) => {
  socket.to(rooms).emit('notificate_new_chat_room', msg);
};

export {
  getChatRoomsEmitter,
  notificateNewChatRoomEmitter
};