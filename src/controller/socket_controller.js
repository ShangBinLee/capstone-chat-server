/**
 * io와 socketUserMap을 받아 io와 socket에 이벤트 핸들러를 부착하는 함수
 * @param {Server} io - socket.io server 인스턴스
 * @param {Array<Function>} middlewares - middleware 배열, 요소들이 순서대로 부착된다
 * @param {Map<String, Object>} roomManager - roomId를 키로 하는 room 관리자
 * @param {Map<String, Set<Socket>} userSocketsMap - userId를 키, 해당 유저의 클라이언트 소켓 id Set을 값으로 하는 Map instance
 */
const initializeSocket = (io, middlewares, roomManager, userSocketsMap) => {
	middlewares.forEach(middleware => {
		io.use(middleware);
	});

	io.on('connection', (socket) => {
    userSocketsMap.has(socket.user.id)
    ? userSocketsMap.get(socket.user.id).add(socket)
    : userSocketsMap.set(socket.user.id, new Set([socket]));

    // 소켓 이벤트 핸들러 부착
    socket.on('disconnecting', () => {
      const userId = socket.user.id;

      userSocketsMap.get(userId)?.delete(socket);

      const roomIds = [...socket.rooms];

      roomIds
      .filter((roomId) => roomId != socket.id)
      .map((roomId) => ({
        roomId,
        sellerId : roomManager.getSellerId(roomId),
        buyerId : roomManager.getBuyerId(roomId)
      }))
      .map(({ roomId, sellerId, buyerId }) => {
        let otherUserId;
        if(sellerId === userId) {
          otherUserId = sellerId;
        } else if(buyerId === userId) {
          otherUserId = buyerId;
        } else {
          throw new Error(`${userId} is not a participant of chat_room ${roomId}. ${sellerId} and ${buyerId} are the participants`);
        }

        return { roomId, otherUserId };
      })
      .forEach(({ roomId, otherUserId }) => {
        if(userSocketsMap.get(otherUserId)?.size === 0) {
          roomManager.deleteRoom(roomId)
        }
      });
    });

		socket.emit('connection', { status : 'connected' });
	});
};

export {
	initializeSocket
};