const insertChatRoom = (pool, chatRoomRecord, query) => {
  const {
    create_date,
    modified_date,
    product_id,
    check_transaction,
    buyer_id 
  } = chatRoomRecord;

  const sql = `INSERT INTO
  chat_room(create_date, modified_date, product_id, check_transaction, buyer_id)
  VALUES(?, ?, ?, ?, ?)`;

  return query(pool, sql, [ create_date, modified_date, product_id, check_transaction, buyer_id ]);
};

export {
  insertChatRoom
};