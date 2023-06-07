import { Server } from 'socket.io';
import Client from 'socket.io-client';
import { createRoomManager } from '#src/room/room_manager.js';
import { initializeSocket } from '#src/controller/socket_controller.js';

describe('connection 이벤트 테스트', () => {
  let io, clientSocket, socketUserMap;

  beforeAll(() => {
    io = new Server();

    const middlewares = [
			(socket, next) => {
				socket.user = { id : 'aifjodsjof123123-123912xkdkdk' };
				next();
			}
    ];

		socketUserMap = new Map();

    initializeSocket(io, middlewares, createRoomManager(), socketUserMap);

    io.listen(3000);
  });

	afterEach(() => {
		clientSocket.close();
	});

  afterAll(() => {
    io.close();
  });

  test('클라이언트 connection 이벤트 수신', (done) => {
    clientSocket = new Client(`http://localhost:${3000}`);
    clientSocket.on("connection", (msg) => {
			expect(msg).toStrictEqual({ status : 'connected' });
			done();
		});
  });

	test('socketUserMap 올바른 키-값 저장', (done) => {
		clientSocket = new Client(`http://localhost:${3000}`);
		clientSocket.on("connection", (msg) => {
      expect(socketUserMap.get('aifjodsjof123123-123912xkdkdk'))
      .toStrictEqual(new Set([clientSocket.id]));
      done();
    });
  })
});