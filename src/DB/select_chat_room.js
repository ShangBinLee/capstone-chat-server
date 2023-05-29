import Pool from "node_modules/mysql2/typings/mysql/lib/Pool";

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
 * id에 해당하는 채팅방의 check_transaction 필드를 가져옴
 * @param {Number} id - 채팅방 id
 * @param {Pool} pool - DB connection pool
 * @param {Function} query - query 함수
 */
const selectCheckTransactionById = (id, pool, query) => {
	const sql = 'SELECT check_transaction FROM chat_room WHERE id = ?';

	return query(pool, sql, id);
};

export {
	selectChatRoomByBuyerId,
	selectChatRoomByProductId,
	selectCheckTransactionById
};