import { selectChatRoomByBuyerId, selectChatRoomByProductId } from './select_chat_room.js';

describe('select_chat_room', () => {
	const makeQuery = (callback) => (pool, sql, args) => {
		callback(pool, sql, args);
	};

	describe('selectChatRoomByBuyerId', () => {
		test('인자 테스트', () => {
			const sqlExpect = `SELECT
			id, modified_date, product_id, check_transaction, buyer_id
			FROM
			chat_room
			WHERE
			buyer_id = ?`;

			const query = makeQuery((pool, sql, args) => {
				expect(pool).not.toBe(undefined);
				expect(sql.replaceAll('\t', '')).toBe(sqlExpect.replaceAll('\t', ''));
				expect(args).toStrictEqual(1);
			});

			selectChatRoomByBuyerId(1, {}, query);
		});
	});

	describe('selectChatRoomByProductId', () => {
		test('인자 테스트', () => {
			const sqlExpect = `SELECT
			id, modified_date, product_id, check_transaction, buyer_id
			FROM
			chat_room
			WHERE
			product_id = ?`;

			const query = makeQuery((pool, sql, args) => {
				expect(pool).not.toBe(undefined);
				expect(sql.replaceAll('\t', '')).toBe(sqlExpect.replaceAll('\t', ''));
				expect(args).toStrictEqual(1);
			});

			selectChatRoomByProductId(1, {}, query);
		});
	});
});