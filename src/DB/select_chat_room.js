const selectChatRoomByBuyerId = (buyerId, pool, query) => {
	const sql = `SELECT
	id, modified_date, product_id, check_transaction, buyer_id
	FROM
	chat_room
	WHERE
	buyer_id = ?`;

	return query(pool, sql, buyerId);
};

export { selectChatRoomByBuyerId };