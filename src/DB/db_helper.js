const createDBPool = (config, db) => db.createPool(config);

const query = async (pool, sql, args) => {
	const [ results ] = await pool.query(sql, args);
	return results;
};

export {
	createDBPool,
	query
};