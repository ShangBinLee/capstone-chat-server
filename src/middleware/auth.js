/**
 * socket이 token을 통한 인증으로 서버에 접속하려고 하는지 확인하는 미들웨어
 */
const tokUseChecker = (socket, next) => {
	const tok = socket.handshake.auth?.token;

	if(tok === undefined || tok === null) {
		next(new Error('사이트 로그인 후 채팅 서버에 접속하세요'));
	}

	next();
};

export { tokUseChecker };