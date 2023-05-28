/**
 * 중앙 서버 API를 통해 tok 소유자가 올린 모든 상품 정보를 가져옴
 * @param {function} fetch - fetch API의 fetch 함수
 * @param {string} tok - 인증을 위한 JWT token
 * @param {string} rootUrl - 중앙 서버 API의 root URL
 */
const fetchSellerProductsAll = (fetch, tok, rootUrl) => {
	const headers = { Authentication : `berear ${tok}` };

	return fetch(`${rootUrl}/saleproduct/find/my/product`, { headers })
		.then(res => res.json());
};

export { fetchSellerProductsAll };