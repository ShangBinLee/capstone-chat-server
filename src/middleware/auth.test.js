import { tokUseChecker, userInfoFetcher } from "./auth";

describe('auth 미들웨어 테스트', () => {
	const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
	'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
	'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  describe('tokUseChecker', () => {
		const nextWithError = (err) => {
			expect(err).toBeInstanceOf(Error);
			expect(err.message).toBe('사이트 로그인 후 채팅 서버에 접속하세요');
		};

		test('올바른 JWT 토큰 테스트', () => {
			const socket = { 
				handshake : {
					auth : {
						token
					}
				}
			};

			tokUseChecker(socket, (err) => {
				expect(err).toBeUndefined();
			});
		});

		test('auth undefined 테스트', () => {
			const socket = { 
				handshake : { }
			};

			tokUseChecker(socket, nextWithError);
		});

		test('auth null 테스트', () => {
			const socket = { 
				handshake : { 
					auth : null
				}
			};

			tokUseChecker(socket, nextWithError);
		});

		test('token undefined 테스트', () => {
			const socket = { 
				handshake : { 
					auth: {
						token : undefined
					}
				}
			};

			tokUseChecker(socket, nextWithError);
		});

		test('token null 테스트', () => {
			const socket = { 
				handshake : { 
					auth: {
						token : null
					}
				}
			};

			tokUseChecker(socket, nextWithError);
		});
	});

	describe('userInfoFetcher', () => {
		const userInfo = {
			id : '3a2f4f46-3242-424d-b60a-effab291eeef'
		};

		const fetchUserInfo = (tok) => {
			expect(tok).toBe(token);

			return Promise.resolve(userInfo);
		}

		const userInfoFetcherMiddleware = userInfoFetcher(fetchUserInfo);

		let socket;
		let socketExpect;

		beforeEach(() => {
			socket = { 
				handshake : {
					auth : {
						token
					}
				}
			};

			socketExpect = { 
				handshake : {
					auth : {
						token
					}
				},
				user : userInfo
			};
		});

		test('socket.user가 fetchUserInfo의 결과값인지', async () => {
			await userInfoFetcherMiddleware(socket, () => {});
			expect(socket).toStrictEqual(socketExpect);
		});

		test('정상 수행 시 next() 호출', () => {
			userInfoFetcherMiddleware(socket, (err) => {
				expect(err).toBeUndefined();
			});
		});
	});
});