import { createDBPool, query } from './db_helper.js';
import dbConfig from './db_config.js';
import mysql from 'mysql2/promise';

describe('query(pool, sql, args)', () => {
	const testConfig = { 
		...dbConfig,
		user : 'bit_chat_test',
		password : '1234',
		database : 'bit_chat_test',
	};

	const pool = createDBPool(testConfig, mysql);
	let dateString;

	beforeAll(async () => {
		dateString = '2023-05-28 20:52:37';
		await pool.query(
			`INSERT INTO chat_room
			(id, create_date, modified_date, product_id, check_transaction, buyer_id)
			VALUES
			(1, ?, ?, 1, false, '1')`,
			[ dateString, dateString ]
		);
	});

	afterAll(async () => {
		await pool.query(
			'DELETE FROM chat_room'
		);

		pool.end();
	});
	
	test(`SELECT시 지정한 필드에 대해서 올바른 타입과 포맷의 값을 리턴하는지`, async () => {
		const rooms = await query(
			pool,
			`SELECT
			id, create_date, modified_date, product_id, check_transaction, buyer_id
			FROM
			chat_room`
		);

		expect(rooms)
		.toStrictEqual([{
			id : 1,
			create_date : dateString,
			modified_date : dateString,
			product_id : 1,
			check_transaction : 0,
			buyer_id : '1'
		}]);
	});
});