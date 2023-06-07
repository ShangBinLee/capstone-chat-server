const createRoomStore = (roomId, sellerId, buyerId) => ({
  roomId,
  buyer : {
    id : buyerId
  },
  seller : {
    id : sellerId
  }
});

const createRoomManager = () => {
  const rooms = new Map();

  const addRoom = (roomId, { sellerId, buyerId }) => rooms.has(roomId) === false && rooms.set(roomId, createRoomStore(roomId, sellerId, buyerId));

  const deleteRoom = (roomId) => rooms.delete(roomId);

  const getBuyerId = (roomId) => rooms.get(roomId)?.buyer.id;

  const getSellerId = (roomId) => rooms.get(roomId)?.seller.id;

  return {
    addRoom,
    deleteRoom,
    getSellerId,
    getBuyerId
  };
};

const joinRooms = (socket, chatRoomIds) => {
  chatRoomIds.forEach(chatRoomId => {
    socket.join(chatRoomId);
  });
};

const checkSocketInRoom = (socket, chatRoomId) => socket.rooms.has(chatRoomId);

export {
  createRoomManager,
  joinRooms,
  checkSocketInRoom
};