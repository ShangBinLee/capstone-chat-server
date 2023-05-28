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

export { selectChatRoomByBuyerId };