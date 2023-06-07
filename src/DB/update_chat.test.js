import { createDBPool, query } from './db_helper.js';
import dbConfig from './db_test_config.js';
import mysql from 'mysql2/promise';
import { insertChat } from "./update_chat.js";

/**
 * db_helper.test.js 와 나중에 통합해서 한 번에 테스트 해야 함(관련 테이블끼리 묶어서)
 */
describe('update_chat', () => {
  const pool = createDBPool(dbConfig, mysql);

  beforeAll(async () => {
		const dateString = '2023-05-28 20:52:37';

    await Promise.all([
      pool.query('ALTER TABLE chat AUTO_INCREMENT = 1'),
      async () => {
        await pool.query(`DELETE FROM chat_room`);
        await pool.query('DELETE FROM chat');
      }
    ]);

		await pool.query(
			`INSERT INTO chat_room
			(id, create_date, modified_date, product_id, check_transaction, buyer_id)
			VALUES
			(1, ?, ?, 1, false, '1')`,
			[ dateString, dateString ]
		);
	});

	afterAll(async () => {
		await pool.query(`DELETE FROM chat_room`);
    await pool.query('DELETE FROM chat');

		pool.end();
	});

  test('insertChat', async () => {
    const chatRecord = {
      chat_content : '안녕하세요. 반갑습니다',
      create_date : '2023-05-30 22:52:37',
      modified_date : '2023-05-30 22:52:37',
      chat_room_id : 1,
      sender_id : '1'
    };

    const result = await insertChat(pool, chatRecord, query);

    expect(result.insertId).toBe(1);
  });
});