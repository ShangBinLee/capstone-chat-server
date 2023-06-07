import { selectChatRoomByProductId } from "#src/DB/select_chat_room.js";
import { insertChatRoom } from "#src/DB/update_chat_room.js";
import { fetchProduct } from "#src/api_client/product/fetch_product.js";
import { notificateNewChatRoomEmitter } from "#src/emitter/chat_room_emitter.js";
import { joinRooms } from "#src/room/room_manager";

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
    return async ({ product_id : productId }) => {
      if(proceeding === true) {
        return;
      }

      const eventName = 'join_new_chat_room';

      proceeding = true;

      const userId = socket.user.id;

      const [ product, isAlreadyJoining ] = await Promise.all([
        fetchProduct(fetch, productId, rootUrl),
        selectChatRoomByProductId(productId, pool, query)
        .then((rooms) => rooms.some((room) => room.buyer_id === userId))
      ]);

      if(isAlreadyJoining === true) {
        return socket.emit(eventName, new Error(`이미 ${productId} 상품의 채팅방에 구매자로 참여하고 있습니다`));
      }

      const sellerId = product.seller_id;

      if(sellerId === userId) {
        return socket.emit(eventName, new Error(`당신은 ${productId} 상품의 판매자입니다`));
      }

      const now = new Date();
      const dateString = now.toLocaleString('en-CA', { hour12 : false }).replace(',', '');

      const chatRoomRecord = {
        create_date : dateString,
        modified_date : dateString,
        product_id : productId,
        check_transaction : false,
        buyer_id : userId
      };

      await insertChatRoom(pool, chatRoomRecord, query);

      proceeding = false;

      const { 
        chat_room_id,
        modified_date,
        product_id,
        buyer_id
      } = await selectChatRoomByProductId(productId, pool, query)
        .then((rooms) => rooms.filter((room) => room.buyer_id === userId));

      roomManager.addRoom(chatRoom.id, { sellerId, buyerId : userId });

      const buyerSockets = [...userSocketsMap.get(userId)];
      const sellerSockets = [...userSocketsMap.get(sellerId)];

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

export {
  joinNewChatRoomHandler
};