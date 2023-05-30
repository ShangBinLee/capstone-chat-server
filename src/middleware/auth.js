/**
 * socket이 token을 통한 인증으로 서버에 접속하려고 하는지 확인하는 미들웨어
 */
const tokUseChecker = (socket, next) => {
	const tok = socket.handshake.auth?.token;

	if(tok === undefined || tok === null) {
		return next(new Error('사이트 로그인 후 채팅 서버에 접속하세요'));
	}

	return next();
};

/**
 * fetch와 rootUrl을 받아 socket의 token으로 유저 정보를 가져오는 미들웨어를 반환한다
 * @param {Function} fetchUserInfo - tok을 받아 중앙 서버로부터 유저 정보를 fetch 하는 함수
 * @return {Function} 미들웨어
 */
const userInfoFetcher = (fetchUserInfo) => async (socket, next) => {
	const tok = socket.handshake.auth.token;
	const userInfo = await fetchUserInfo(tok);

	socket.user = userInfo;

	return next();
}

export { 
	tokUseChecker,
	userInfoFetcher
};