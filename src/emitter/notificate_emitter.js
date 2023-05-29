/**
 * notificate_connection 이벤트로 유저의 채팅방 접속 알림을 다른 채팅방 유저들에게 보냄
 * @param {Socket} socket
 * @param {String} roomName - 메시지를 broadcast 할 room 이름
 * @param {Object} msg - 전송할 메시지
 */
const notificateConnectionEmitter = (socket, roomName, msg) => {
	socket.to(roomName).emit('notificate_connection', msg);
};

export {
	notificateConnectionEmitter
};