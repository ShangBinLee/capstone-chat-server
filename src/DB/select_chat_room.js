const sqlFromChatRoom = `SELECT
id, modified_date, product_id, check_transaction, buyer_id
FROM
chat_room`;

const selectChatRoomByBuyerId = (buyerId, pool, query) => {
	const sql = `${sqlFromChatRoom}
	WHERE
	buyer_id = ?`;

	return query(pool, sql, buyerId);
};

const selectChatRoomByProductId = (productId, pool, query) => {
	const sql = `${sqlFromChatRoom}
	WHERE
	product_id = ?`;

	return query(pool, sql, productId);
}

/**
 * id에 해당하는 채팅방의 product_id 필드를 가져옴
 * @param {Number} id - 채팅방 id
 * @param {Pool} pool - DB connection pool
 * @param {Function} query - query 함수
 */
const selectProductIdById = (id, pool, query) => {
	const sql = 'SELECT product_id FROM chat_room WHERE id = ?';

  return query(pool, sql, id);
};

/**
 * id에 해당하는 채팅방의 check_transaction 필드를 가져옴
 * @param {Number} id - 채팅방 id
 * @param {Pool} pool - DB connection pool
 * @param {Function} query - query 함수
 */
const selectCheckTransactionById = (id, pool, query) => {
	const sql = 'SELECT check_transaction FROM chat_room WHERE id = ?';

	return query(pool, sql, id);
};

/**
 * 상품에 대한 거래가 성립된 채팅방의 id를 가져옴
 * @param {Number} productId - 상품 id
 * @param {Pool} pool - DB connecton pool
 * @param {Function} query - query 함수
 */
const selectTradingRoomIdByProductId = (productId, pool, query) => {
	const sql = 'SELECT id FROM chat_room WHERE product_id = ? AND check_transaction = true';

	return query(pool, sql, productId);
};

export {
	selectChatRoomByBuyerId,
	selectChatRoomByProductId,
  selectProductIdById,
	selectCheckTransactionById,
	selectTradingRoomIdByProductId
};