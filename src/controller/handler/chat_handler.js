import { selectChatCreateDate, selectChatHistoryAfter } from "#src/DB/select_chat";
import { checkSocketInRoom } from "#src/room/room_manager";

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

  if(checkSocketInRoom(socket, chatRoomId)) {
    return socket.emit(eventName, []);
  }

  const resultRecord = await selectChatCreateDate(lastChatId, pool, query);

  const dateString = resultRecord[0];

  if(dateString === undefined) {
    return socket.emit(eventName, []);
  }

  const chatHistory = await selectChatHistoryAfter(chatRoomId, dateString, pool, query);

  return socket.emit(eventName, { 
    chat_room_id : chatRoomId, 
    chat_history : chatHistory
  });
};

export {
  getChatHistoryHandler
};