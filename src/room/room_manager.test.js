import { createRoomManager } from "./room_manager.js";

describe('room_manager', () => {
  test('addRoom', () => {
    const expected = new Map([
      [
        2,
        {
          roomId : 2,
          seller : {
            id : 'sa234xas'
          },
          buyer : {
              id : 'adfasdfsa'
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
      expect(manager.deleteRoom(102))
      .toBe(false);
      expect(manager.getSellerId(1))
      .toBeUndefined();
      expect(manager.getBuyerId(5))
      .toBeUndefined();
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
	});
});