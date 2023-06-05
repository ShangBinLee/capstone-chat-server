const joinRooms = (socket, chatRoomIds) => {
  chatRoomIds.forEach(chatRoomId => {
    socket.join(chatRoomId);
  });
};

const checkSocketInRoom = (socket, chatRoomId) => socket.rooms.has(chatRoomId);

export {
  joinRooms,
  checkSocketInRoom
};