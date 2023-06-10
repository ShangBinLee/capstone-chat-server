/**
 * 중앙 서버 API를 통해 tok 소유자의 유저 정보를 가져옴
 * @param {function} fetch - fetch API의 fetch 함수
 * @param {string} authorization - HTTP headers의 Authorization에 해당하는 값
 * @param {string} rootUrl - 중앙 서버 API의 root URL
 */
const fetchUserInfo = (fetch, authorization, rootUrl) => {
	const headers = { 'Authorization' : authorization };

	return fetch(`${rootUrl}/api/user/info`, { headers })
		.then((res) => res.json());
};

const fetchUserInfoById  = (fetch, userId, rootUrl) => {
	const params = {
    field : 'all'
  };

  const queryString = new URLSearchParams(params).toString();

  return fetch(`${rootUrl}/chat/user/${userId}/info?${queryString}`)
    .then((res) => res.json());
}
export { 
  fetchUserInfo,
  fetchUserInfoById
};
