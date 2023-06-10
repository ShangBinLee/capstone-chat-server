import { selectChatRoomByBuyerId, selectChatRoomById, selectChatRoomByProductId } from "#src/DB/select_chat_room.js";
import { insertChatRoom } from "#src/DB/update_chat_room.js";
import { fetchProduct } from "#src/api_client/product/fetch_product.js";
import { getChatRoomsEmitter, notificateNewChatRoomEmitter } from "#src/emitter/chat_room_emitter.js";
import { checkSocketInRoom, joinRooms } from "#src/room/room_manager.js";

/**
 * 송신 클라이언트 소켓이 접속 되어 있는 채팅방 정보를 응답하는 핸들러
 * @param {Socket} socket - 핸들러가 부착될 socket
 * @param {Pool} pool - DB connection pool
 */
const getChatRoomsHandler = (socket, pool, query) => async () => {
  const roomIds = [...socket.rooms];

  const rooms = await Promise.all(roomIds.map((roomId) => selectChatRoomById(roomId, pool, query)));

  const message = rooms.map(({ id, modified_date, product_id }) => ({
    chat_room_id : id,
    modified_date,
    product_id
  }));

  getChatRoomsEmitter(socket, message);
};

/**
 * 특정 상품의 채팅방에 구매자로서 참여하고자 하는 요청을 처리하는 핸들러
 * @param {Socket} socket - 핸들러가 부착될 socket
 * @param {Pool} pool - DB connection pool
 * @param {Function} query - query 함수
 * @param {Function} fetch - fetch API의 fetch 함수
 * @param {string} rootUrl - 중앙 서버 API의 root URL
 */
const joinNewChatRoomHandler = (socket, pool, query, fetch, rootUrl) => {
  return (roomManager, userSocketsMap) => {
    let proceeding = false;
    return async ({ product_id : productId, authorization }) => {
      if(proceeding === true) {
        return;
      }

      const eventName = 'join_new_chat_room';

      proceeding = true;

      const userId = socket.user.id;

      const [ product, isAlreadyJoining ] = await Promise.all([
        fetchProduct(fetch, productId, rootUrl, authorization)
        .then(({ data }) => data),
        selectChatRoomByProductId(productId, pool, query)
        .then((rooms) => rooms.some((room) => room.buyer_id === userId))
      ]);

      if(isAlreadyJoining === true) {
        proceeding = false;
        return socket.emit(eventName, new Error(`이미 ${productId} 상품의 채팅방에 구매자로 참여하고 있습니다`));
      }

      const sellerId = product.studentId;

      if(sellerId === undefined) {
        proceeding = false;
        throw new Error('studenId is missing');
      }
      if(sellerId === userId) {
        proceeding = false;
        return socket.emit(eventName, new Error(`당신은 ${productId} 상품의 판매자입니다`));
      }

      const now = new Date();
      const dateString = now.toLocaleDateString('ko-kr');
      const dateTime = dateString.slice(0, dateString.length - 1).replaceAll('. ', '-') + ' ' + now.toLocaleTimeString('ko', { timeStyle : 'medium', hour12 : false });

      const chatRoomRecord = {
        create_date : dateTime,
        modified_date : dateTime,
        product_id : productId,
        check_transaction : false,
        buyer_id : userId
      };

      await insertChatRoom(pool, chatRoomRecord, query);

      proceeding = false;

      const [{
        id : chat_room_id,
        modified_date,
        product_id,
        buyer_id
      }] = await selectChatRoomByProductId(productId, pool, query)
        .then((rooms) => rooms.filter((room) => room.buyer_id === userId));

      roomManager.addRoom(chat_room_id, { sellerId, buyerId : userId });

      const buyerSockets = [...userSocketsMap.get(userId)];
      const sellerSocketSet = userSocketsMap.get(sellerId)
      const sellerSockets = sellerSocketSet?.size > 0 ? [ ...sellerSocketSet ] : [];

      const buyerMsg = {
        chat_room_id,
	      modified_date,
	      product_id
      };

      buyerSockets.forEach((socket) => joinRooms(socket, [chat_room_id]));
      sellerSockets.forEach((socket) => joinRooms(socket, [chat_room_id]));

      socket.emit(eventName, buyerMsg);
      socket.to(buyerSockets.map((socket) => socket.id)).emit(eventName, buyerMsg);

      const sellerMsg = {
        chat_room_id,
        modified_date,
        product_id,
        buyer_id
      };

      notificateNewChatRoomEmitter(socket, sellerSockets.map((socket) => socket.id), sellerMsg);
    };
  };
};

/**
 * 유저가 참여하는 모든 채팅방에 접속하고자 하는 요청을 처리하는 핸들러
 * @param {Socket} socket - 핸들러가 부착될 socket
 * @param {Pool} pool - DB connection pool
 * @param {Function} query - query 함수
 * @param {Function} fetch - fetch API의 fetch 함수
 * @param {string} rootUrl - 중앙 서버 API의 root URL
 */
const connectChatRoomsHandler = (socket, pool, query, fetch, rootUrl) => {
  return (roomManager, userSocketsMap) => {
    return async ({ product_ids : productIds, authorization }) => {
      const eventName = 'connect_chat_rooms';

      const userId = socket.user.id;

      const [ buyerChatRooms, sellerChatRooms ] = await Promise.all([
        selectChatRoomByBuyerId(userId, pool, query),
        Promise.all(
          productIds.map((productId) => {
            return selectChatRoomByProductId(productId, pool, query)
          })
        ).then((results) => results.flat())
      ]);

      const buyerRoomsAdd = await Promise.all(buyerChatRooms
      .filter((room) => checkSocketInRoom(socket, room.id))
      .filter((room) => roomManager.getBuyerId(room.id) === undefined)
      .map(async (room) => {
        const result = await fetchProduct(fetch, room.product_id, rootUrl)
        
        const sellerId = result.seller_id;

        return {
          roomId : room.id,
          sellerId : sellerId,
          buyerId : userId
        };
      }));

      const sellerRoomsAdd = sellerChatRooms
      .filter((room) => checkSocketInRoom(socket, room.id))
      .filter((room) => roomManager.getSellerId(room.id) === undefined)
      .map((room) => ({
        roomId : room.id,
        sellerId : userId,
        buyerId : room.buyer_id
      }));

      buyerRoomsAdd.forEach(({ roomId, sellerId, buyerId }) => {
        roomManager.addRoom(roomId, { sellerId, buyerId });
      });
      sellerRoomsAdd.forEach(({ roomId, sellerId, buyerId }) => {
        roomManager.addRoom(roomId, { sellerId, buyerId });
      });

      buyerChatRooms.forEach((room) => joinRooms(socket, room.id));
      sellerChatRooms.forEach((room) => joinRooms(socket, room.id));

      socket.emit(eventName, { success : true, room_ids_fail : []});
    };
  };
};

export {
  getChatRoomsHandler,
  joinNewChatRoomHandler,
  connectChatRoomsHandler
};