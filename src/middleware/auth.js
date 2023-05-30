import { fetchUserInfo } from '#src/api_client/user/fetch_user.js';

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

/**
 * fetch와 rootUrl을 받아 socket의 token으로 유저 정보를 가져오는 미들웨어를 반환한다
 * @param {Function} fetch - fetch 함수
 * @param {String} rootUrl - 중앙 서버 api root url
 * @return {Function} 미들웨어
 */
const userInfoFetcher = (fetch, rootUrl) => async (socket, next) => {
	const tok = socket.handshake.auth.token;
	const userInfo = await fetchUserInfo(fetch, tok, rootUrl);

	socket.user = userInfo;

	next();
}

export { 
	tokUseChecker,
	userInfoFetcher
};