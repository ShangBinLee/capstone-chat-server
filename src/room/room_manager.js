const createRoomStore = (roomId, sellerId, buyerId) => ({
  roomId,
  buyer : {
    id : buyerId,
    sockets : new Set()
  },
  seller : {
    id : sellerId,
    sockets : new Set()
  }
});

const createRoomManager = () => {
  const rooms = new Map();

  const addBuyerSocket = (roomId, socketId) => rooms.get(roomId)?.buyer.sockets.add(socketId);

  const addSellerSocket = (roomId, socketId) => rooms.get(roomId)?.seller.sockets.add(socketId);

  const addRoom = (roomId, { sellerId, buyerId }) => rooms.has(roomId) === false && rooms.set(roomId, createRoomStore(roomId, sellerId, buyerId));

  const deleteBuyerSocket = (roomId, socketId) => rooms.get(roomId)?.buyer.sockets.delete(socketId);

  const deleteSellerSocket = (roomId, socketId) => rooms.get(roomId)?.seller.sockets.delete(socketId);

  const deleteRoom = (roomId) => rooms.delete(roomId);

  const getBuyerId = (roomId) => rooms.get(roomId)?.buyer.id;

  const getSellerId = (roomId) => rooms.get(roomId)?.seller.id;

  const getSellerSockets = (roomId) => {
    const sockets = rooms.get(roomId)?.seller.sockets;

    return sockets === undefined
    ? []
    : [...sockets];
  };

  const getBuyerSockets = (roomId) => {
    const sockets = rooms.get(roomId)?.buyer.sockets;

    return sockets === undefined
    ? []
    : [...sockets];
  };

  return {
    addSellerSocket,
    addBuyerSocket,
    addRoom,
    deleteSellerSocket,
    deleteBuyerSocket,
    deleteRoom,
    getSellerId,
    getBuyerId,
    getSellerSockets,
    getBuyerSockets
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