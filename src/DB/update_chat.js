const insertChat = (pool, chatRecord, query) => {
  const {
    content,
    create_date,
    modified_date,
    chat_room_id,
    sender_id
  } = chatRecord;

  const sql = `INSERT INTO
  chat(chat_content, create_date, modified_date, chat_room_id, sender_id)
  VALUES(?, ?, ?, ?, ?)`;

  return query(pool, sql, [ content, create_date, modified_date, chat_room_id, sender_id ]);
};

export {
  insertChat
};