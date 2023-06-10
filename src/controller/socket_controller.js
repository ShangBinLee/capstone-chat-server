import { connectChatRoomsHandler, getChatRoomsHandler, joinNewChatRoomHandler } from "./handler/chat_room_handler";
import { getChatHistoryHandler, newChatHandler } from "./handler/chat_handler";
import { offerPriceHandler } from "./handler/trade_handler";
import { createDBPool, query } from '#DB/db_helper.js';
import dbConfig from '#DB/db_config.js';
import mysql from 'mysql2/promise';
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from 'fs';
import fetch from 'node-fetch';

/**
 * io와 socketUserMap을 받아 io와 socket에 이벤트 핸들러를 부착하는 함수
 * @param {Server} io - socket.io server 인스턴스
 * @param {Array<Function>} middlewares - middleware 배열, 요소들이 순서대로 부착된다
 * @param {Map<String, Object>} roomManager - roomId를 키로 하는 room 관리자
 * @param {Map<String, Set<Socket>} userSocketsMap - userId를 키, 해당 유저의 클라이언트 소켓 id Set을 값으로 하는 Map instance
 */
const initializeSocket = (io, middlewares, roomManager, userSocketsMap) => {
  const pool = createDBPool(dbConfig, mysql);
  const _dirname = path.dirname(fileURLToPath(import.meta.url));
  const configJson = readFileSync(path.join(_dirname, '../../config.json'));
  const { rootUrl } = JSON.parse(configJson);

	middlewares.forEach(middleware => {
		io.use(middleware);
	});

	io.on('connection', (socket) => {
    // 현재 소켓을 접속 중인 유저 소켓 목록에 추가
    userSocketsMap.has(socket.user.id)
    ? userSocketsMap.get(socket.user.id).add(socket)
    : userSocketsMap.set(socket.user.id, new Set([socket]));

    // 이벤트 핸들러 부착
    socket.on('disconnecting', () => {
      const userId = socket.user.id;

      // 접속 중인 유저 소켓 목록에서 현재 소켓 제거
      userSocketsMap.get(userId)?.delete(socket);

      const roomIds = [...socket.rooms];

      // roomManager 에서 접속 중이었던 채팅방에 더 이상 접속 소켓이 없을 경우 해당 채팅방 정보를 제거
      roomIds
      .filter((roomId) => roomId != socket.id)
      .map((roomId) => ({
        roomId,
        sellerId : roomManager.getSellerId(roomId),
        buyerId : roomManager.getBuyerId(roomId)
      }))
      .map(({ roomId, sellerId, buyerId }) => {
        let otherUserId;
        if(sellerId === userId) {
          otherUserId = sellerId;
        } else if(buyerId === userId) {
          otherUserId = buyerId;
        } else {
          throw new Error(`${userId} is not a participant of chat_room ${roomId}. ${sellerId} and ${buyerId} are the participants`);
        }

        return { roomId, otherUserId };
      })
      .forEach(({ roomId, otherUserId }) => {
        if(userSocketsMap.get(otherUserId)?.size === 0) {
          roomManager.deleteRoom(roomId)
        }
      });
    });

    socket.on(
      'connect_chat_rooms',
      connectChatRoomsHandler(socket, pool, query, fetch, rootUrl)(roomManager, userSocketsMap)
    );

    socket.on(
      'get_chat_rooms',
      getChatRoomsHandler(socket, pool, query)
    );

    socket.on('get_chat_history', getChatHistoryHandler(socket, pool, query));

    socket.on(
      'join_new_chat_room',
      joinNewChatRoomHandler(socket, pool, query, fetch, rootUrl)(roomManager, userSocketsMap)
    );

    socket.on('new_chat', newChatHandler(socket, query, pool));

    socket.on('offer_price', offerPriceHandler(socket, pool, query, roomManager, userSocketsMap));

		socket.emit('connection', { status : 'connected' });
	});
};

export {
	initializeSocket
};