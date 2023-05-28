import mysql from 'mysql2/promise';
import dbConfig from './db_config.js';

describe('dbConfig', () => {
	const pool = mysql.createPool(dbConfig);

	afterAll(() => {
		pool.end();
	});

	test('실제 db에 접속할 수 있는 올바른 config인지', async () => {
		const [[ result ]] = await pool.query('SELECT DATABASE() as current_db');

		expect(result.current_db).toBe('bit_chat');
	});
});