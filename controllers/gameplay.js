const Game = require('./game');
const fs = require('fs');

class GamePlay {
	constructor() {
		this.counter = 1;
	}

	init() {
		return new Promise(async (resolve, reject) => {
			try {
				let game;
				if (fs.existsSync('./recover.json')) {
					let recover = JSON.parse(fs.readFileSync('./recover.json'));
					if (recover && recover.counter) {
						this.counter = recover.counter;
					}
					if (recover && recover.currentGameId) {
						game = await new Game({}).recreateById(recover.currentGameId);
					} else {
						game = await new Game({}).create(`Game ${this.counter}`);
					}
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

	toString() {
		let obj = {
			counter: this.counter,
			currentGameId: this.game.id
		}
		return JSON.stringify(obj);
	}
}

module.exports = GamePlay;
