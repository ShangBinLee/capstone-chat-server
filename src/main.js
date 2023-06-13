import { Server } from 'socket.io';
import dbConfig from '#DB/db_config.js';
import { createDBPool, query } from '#DB/db_helper.js';
import mysql from 'mysql2/promise';
import fetch from 'node-fetch';
import { fileURLToPath } from "url";
import { readFileSync } from 'fs';
import path from "path";
import { initializeSocket } from '#src/controller/socket_controller.js';
import { tokUseChecker, userInfoFetcher } from './middleware/auth.js';
import { tokUseCheckerDevelop } from './middleware/auth.develop.js';
import { createRoomManager } from '#src/room/room_manager.js';

const io = new Server({ cors: { origin: "*" } });

const pool = createDBPool(dbConfig, mysql);
const _dirname = path.dirname(fileURLToPath(import.meta.url));
const configJson = readFileSync(path.join(_dirname, '../config.json'));
const { rootUrl } = JSON.parse(configJson);

const tokUseCheckerMap = {
    'production' : tokUseChecker,
    'development' : tokUseCheckerDevelop,
    'test' : tokUseCheckerDevelop
};

const tokUseCheckerUsed = tokUseCheckerMap[process.env.NODE_ENV];

if(tokUseCheckerUsed === undefined) {
    throw new Error('유효하지 않은 NODE_ENV :' + process.env.NODE_ENV);
}

const middlewares = [tokUseCheckerUsed, userInfoFetcher(fetch, rootUrl)];

initializeSocket(pool, query, fetch, rootUrl)(io, middlewares, createRoomManager(), new Map());

io.listen(3000, () => { console.log("it is listening!") });

io.on('error', (err) => {
    console.error('socket.io error occured!\n');
    console.error(err);
});

process.on('unhandledRejection', (error, promise) => {
    console.error('unhandledRejection occured!\n');
    console.error(promise);
    console.error('error\n');
    console.error(error);
});
  
process.on('uncaughtException', (error) => {
    console.error('uncaughtException occured!\n');
    console.error(error);
});