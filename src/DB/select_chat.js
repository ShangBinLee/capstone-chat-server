const selectChatCreateDate = (chatId, pool, query) => {
    const sql = 'SELECT create_date FROM chat WHERE id = ?';

    return query(pool, sql, chatId);
};

export {
    selectChatCreateDate
};