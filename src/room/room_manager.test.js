import { createRoomManager } from "./room_manager.js";

describe('room_manager', () => {
  test('addRoom', () => {
    const expected = new Map([
      [
        2,
        {
          roomId : 2,
          seller : {
            id : 'sa234xas',
            sockets : new Set()
          },
          buyer : {
              id : 'adfasdfsa',
              sockets : new Set()
          }
        }
      ]
    ]);

    expect(createRoomManager().addRoom(2, { sellerId : 'sa234xas', buyerId : 'adfasdfsa' }))
    .toStrictEqual(expected);
  });

  test('addRoom 같은 roomId에 대해서 중복', () => {
    const manager = createRoomManager();
    manager.addRoom(2, { sellerId : 'sa234xas', buyerId : 'adfasdfsa' });
    expect(manager.addRoom(2, { sellerId : 'dijdfai212', buyerId : 'daifdmnx22-ss' }))
    .toBe(false);
  });

	describe('createRoomManager', () => {
    let manager;

    beforeEach(() => {
      manager = createRoomManager();
      manager.addRoom(2, { sellerId : 'sa234xas', buyerId : 'adfasdfsa' });
    });
    
    test('존재하지 않는 roomId를 인자로 넘겼을 때', () => {
      expect(manager.addSellerSocket(3, 'sa234xas'))
      .toBeUndefined();
      expect(manager.addBuyerSocket(1, 'adfasdfsa'))
      .toBeUndefined();
      expect(manager.deleteSellerSocket(5404, 'sa234xas'))
      .toBeUndefined();
      expect(manager.deleteBuyerSocket(120, 'adfasdfsa'))
      .toBeUndefined();
      expect(manager.deleteRoom(102))
      .toBe(false);
      expect(manager.getSellerId(1))
      .toBeUndefined();
      expect(manager.getBuyerId(5))
      .toBeUndefined();
      expect(manager.getSellerSockets(391920320))
      .toStrictEqual([]);
      expect(manager.getBuyerSockets(291929))
      .toStrictEqual([]);
    });

    test('addSellerSocket', () => {
      expect(manager.addSellerSocket(2, 22))
      .toStrictEqual(new Set([22]));
    });

		test('addBuyerSocket', () => {
			expect(manager.addBuyerSocket(2, 32))
      .toStrictEqual(new Set([32]));
		});
    
    test('deleteSellerSocket', () => {
      manager.addSellerSocket(2, 12);
      expect(manager.deleteSellerSocket(2, 12))
      .toBe(true);
      expect(manager.deleteSellerSocket(2, 12))
      .toBe(false);
    });

    test('deleteBuyerSocket', () => {
      manager.addBuyerSocket(2, 12);
      expect(manager.deleteBuyerSocket(2, 12))
      .toBe(true);
      expect(manager.deleteBuyerSocket(2, 12))
      .toBe(false);
    });
    
    test('deleteRoom', () => {
      expect(manager.deleteRoom(2))
      .toBe(true);
      expect(manager.deleteRoom(2))
      .toBe(false);
    });

    test('getSellerId', () => {
      expect(manager.getSellerId(2))
      .toBe('sa234xas');
    });

    test('getBuyerId', () =>{
      expect(manager.getBuyerId(2))
      .toBe('adfasdfsa');
    });

    test('getSellerSockets', () => {
      manager.addSellerSocket(2, 'diajfida-212xxasads');
      expect(manager.getSellerSockets(2))
      .toStrictEqual(['diajfida-212xxasads']);
    });

    test('getBuyerSockets', () => {
      manager.addSellerSocket(2, 'd43xcxasfuj313');
      expect(manager.getSellerSockets(2))
      .toStrictEqual(['d43xcxasfuj313']);
    });
	});
});