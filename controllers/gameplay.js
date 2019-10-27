const Game = require('./game');

class GamePlay {
	constructor() {
		this.counter = 1;
	}

	init({ gameId }) {
		return new Promise(async (resolve, reject) => {
			try {
				let game;
				if (gameId) {
					game = await new Game({}).recreateById(gameId);
				} else {
					game = await new Game({}).create(`Game ${this.counter}`);
                }
				this.game = game;
				resolve();
			} catch (e) {
				global.global.logger.error(e);
				reject(e);
			}
		});
	}
}

module.exports = GamePlay;
