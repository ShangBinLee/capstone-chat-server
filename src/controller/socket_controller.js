/**
 * io와 socketUserMap을 받아 io와 socket에 이벤트 핸들러를 부착하는 함수
 * @param {Server} io - socket.io server 인스턴스
 * @param {Array<Function>} middlewares - middleware 배열, 요소들이 순서대로 부착된다
 * @param {Map<String, Object>} roomManager - roomId를 키로 하는 room 관리자
 */
const initializeSocket = (io, middlewares, roomManager) => {
	middlewares.forEach(middleware => {
		io.use(middleware);
	});

	io.on('connection', (socket) => {
		// 소켓 이벤트 핸들러 부착
    
		socket.emit('connection', { status : 'connected' });
	});
};

export {
	initializeSocket
};