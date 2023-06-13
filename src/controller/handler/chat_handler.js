import { selectChatCreateDate, selectChatHistoryAfter } from "#src/DB/select_chat.js";
import { insertChat } from "#src/DB/update_chat.js";
import { checkSocketInRoom } from "#src/room/room_manager.js";

/**
 * 특정 채팅방의 특정 채팅 이후의 채팅 내역을 응답하는 핸들러
 * 
 * 예외 발생 시 빈 배열을 emit
 * @param {Socket} socket - 핸들러가 부착될 socket
 * @param {Pool} pool - DB connection pool
 * @param {Function} query - query 함수
 */
const getChatHistoryHandler = (socket, pool, query) => async ({ chat_room_id : chatRoomId, last_chat_id : lastChatId }) => {
  const eventName = 'get_chat_history';

  if(checkSocketInRoom(socket, chatRoomId) === false) {
    return socket.emit(eventName, []);
  }

  const resultRecord = await selectChatCreateDate(lastChatId, pool, query);

  const dateString = resultRecord[0]?.create_date;

  if(dateString === undefined) {
    return socket.emit(eventName, { chat_room_id : chatRoomId, chat_history : [] });
  }

  const chatHistory = await selectChatHistoryAfter(chatRoomId, dateString, pool, query);

  return socket.emit(eventName, { 
    chat_room_id : chatRoomId, 
    chat_history : chatHistory
  });
};

const newChatHandler = (socket, query, pool) => async ( { chat_room_id, chat_content }) => {
  const eventName = 'new_chat';

  const userId = socket.user.id;

  if(checkSocketInRoom(socket, chat_room_id) === false) {
    return socket.emit(eventName, { error_message : `${chat_room_id} 채팅방에 접속되어 있지 않습니다` });
  }

  const now = new Date();
  const dateString = now.toLocaleDateString('ko-kr');
  const dateTime = dateString.slice(0, dateString.length - 1).replaceAll('. ', '-') + ' ' + now.toLocaleTimeString('ko', { timeStyle : 'medium', hour12 : false });

  const chatRecord = {
    chat_content,
    create_date : dateTime,
    modified_date : dateTime,
    chat_room_id,
    sender_id : userId
  };

  const result = await insertChat(pool, chatRecord, query);
  const chat_id = result.insertId;

  socket.emit(eventName, { chat_id, ...chatRecord });
  socket.to(chat_room_id).emit(eventName, { chat_id, ...chatRecord });
};

export {
  getChatHistoryHandler,
  newChatHandler
};