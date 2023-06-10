/**
 * 중앙 서버 API를 통해 productId에 해당하는 상품 정보를 가져옴
 * @param {Function} fetch - fetch API의 fetch 함수
 * @param {Number} productId - 조회할 상품 id
 * @param {string} rootUrl - 중앙 서버 API의 root URL
 * @param {string} authorization - HTTP headers의 Authorization에 해당하는 값
 */
const fetchProduct = (fetch, productId, rootUrl, authorization) => {
	return fetch(`${rootUrl}/api/saleproduct/find/${productId}`, {
		headers : {
			'Content-type' : 'application/json',
			'Authorization' : authorization
		}
	}).then((res) => res.json());
};

export {
  fetchProduct
};