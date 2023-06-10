import { selectProductIdById, selectTradingRoomIdByProductId } from "#src/DB/select_chat_room.js";
import { fetchProduct } from "#src/api_client/product/fetch_product.js";
import { checkSocketInRoom } from "#src/room/room_manager.js";

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

/**
 * 특정 채팅방에 연결된 상품의 합의 가격을 제시하는 요청을 처리하고 응답하는 핸들러
 * @param {Socket} socket - 핸들러가 부착될 socket
 * @param {Pool} pool - DB connection pool
 * @param {Function} query - query 함수
 * @param {Map<String, Object>} roomManager - roomId를 키로 하는 room 관리자
 * @param {Map<String, Set<Socket>} userSocketsMap - userId를 키, 해당 유저의 클라이언트 소켓 id Set을 값으로 하는 Map instance
 */
const offerPriceHandler = (socket, pool, query, roomManager, userSocketsMap) => {
  return async ({ chat_room_id : chatRoomId, offer_price : offerPrice }) => {
    const eventName = 'offer_price';

    if(checkSocketInRoom(socket, chatRoomId) === false) {
      return socket.emit(eventName, new Error('채팅방에 접속 되어 있지 않습니다'));
    }

    const roomUsers =[
      roomManager.getSellerId(chatRoomId),
      roomManager.getBuyerId(chatRoomId)
    ];

    if(roomUsers.find((userId) => socket.user.id === userId) === undefined) {
      return socket.emit(eventName, new Error('채팅방에 참여하고 있지 않습니다'));
    }

    const otherUserId = roomUsers.find((userId) => socket.user.id !== userId);

    const otherUserSockets = userSocketsMap.get(otherUserId);

    if(otherUserSockets.size === 0) {
      return socket.emit(eventName, new Error('상대방이 채팅방에 접속 되어 있지 않습니다'));
    }

    const productId = selectProductIdById(chatRoomId, pool, query);

    const tradingRoom = await selectTradingRoomIdByProductId(productId);

    if(tradingRoom.length !== 0) {
      return socket.emit(eventName, new Error('이미 거래 중인 상품입니다'));
    }

    const message = {
      chat_room_id : chatRoomId,
	    offerer_id : socket.user.id,
	    offer_price : offerPrice
    };

    // 송신 클라이언트 소켓 + 채팅방 join 중인 소켓에게 emit
    socket.emit(eventName, message)
    socket.to(chatRoomId).emit(eventName, message);
  };
};

export {
  getDealInfoHandler,
  offerPriceHandler
};