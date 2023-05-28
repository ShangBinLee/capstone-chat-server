const selectChatCreateDate = (chatId, pool, query) => {
    const sql = 'SELECT create_date FROM chat WHERE id = ?';

    return query(pool, sql, chatId);
};

const selectChatHistoryAfter = (chatRoomId, dateString, pool, query) => {
    const sql = `SELECT id, chat_content, create_date
    FROM chat
    WHERE chat_room_id = ? and create_date > ?
    ORDER BY create_date ASC`;

    return query(pool, sql, [ chatRoomId, dateString ]);
};

export {
    selectChatCreateDate,
    selectChatHistoryAfter
};