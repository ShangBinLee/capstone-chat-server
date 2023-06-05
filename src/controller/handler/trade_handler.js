import { selectProductIdById, selectTradingRoomIdByProductId } from "#src/DB/select_chat_room";
import { fetchProduct } from "#src/api_client/product/fetch_product";
import { checkSocketInRoom } from "#src/room/room_manager";

/**
 * 특정 채팅방에 연결된 상품의 거래 성립 확인을 위한 정보 요청에 응답하는 핸들러
 * @param {Socket} socket - 핸들러가 부착될 socket
 * @param {Pool} pool - DB connection pool
 * @param {Function} query - query 함수
 * @param {Function} fetch - fetch API의 fetch 함수
 * @param {string} rootUrl - 중앙 서버 API의 root URL
 */
const getDealInfoHandler = (socket, pool, query, fetch, rootUrl) => async ({ chat_room_id : chatRoomId }) => {
  const eventName = 'get_chat_history';

  if(checkSocketInRoom(socket, chatRoomId) === true) {
    return socket.emit(eventName, { error : new Error(`클라이언트가 ${chatRoomId}에 접속되어 있지 않습니다`) });
  }

  const productId = await selectProductIdById(chatRoomId, pool, query)
    .then((result) => result[0]);

  const tradingRoomId = await selectTradingRoomIdByProductId(productId, pool, query)
    .then((result) => result[0]);

  // 거래 미성립 시
  if(tradingRoomId === undefined) {
    return socket.emit(eventName, {
      request_chat_room_id : chatRoomId,
      is_established : false,
      offer_info : null
    });
  }

  // 다른 채팅방에서 거래 성립 시
  if(tradingRoomId !== chatRoomId) {
    return socket.emit(eventName, {
      request_chat_room_id : chatRoomId,
      is_established : true,
      offer_info : {
        is_own_deal : false,
        established_chat_room_id : null,
        offerer_id : null
      }
    });
  }

  const { offerer_id } = await fetchProduct(fetch, productId, rootUrl);

  // 해당 채팅방에서 거래 성립 시
  return socket.emit(eventName, {
    request_chat_room_id : chatRoomId,
    is_established : true,
    offer_info : {
      is_own_deal : true,
      established_chat_room_id : chatRoomId,
      offerer_id
    }
  });
};

export {
  getDealInfoHandler
};