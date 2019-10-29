const fs = require('fs');
const Game = require('./game');

class GamePlay {
	constructor() {
		this.counter = 1;
	}

	init() {
		return new Promise(async (resolve, reject) => {
			try {
				let game;
				if (fs.existsSync('./recover.json')) {
					const recover = JSON.parse(fs.readFileSync('./recover.json'));
					if (recover && recover.counter) {
						this.counter = recover.counter;
					}
					if (recover && recover.currentGameId) {
						game = await new Game({}).recreateById(recover.currentGameId);
						if (recover.gameProgress) {
							game.status = recover.gameProgress.status;
							game.logs = recover.gameProgress.logs;
							await game.updateModel();
							await Promise.all(game.armies.map((army) => {
								army.health = recover.gameProgress.armies[army.id].health;
								army.alive = recover.gameProgress.armies[army.id].alive;
								return army.updateModel();
							}));
							game.armies.filter((army) => army.alive).forEach((army) => {
								army.scheduleAttack(game, recover.gameProgress.armies[army.id].nextAttack);
							});
						}
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
		if (this.game) {
			const obj = {
				counter: this.counter,
				currentGameId: this.game.id,
			};
			if (this.game.status === 'In progress') {
				obj.gameProgress = this.game.toJson();
			}
			return JSON.stringify(obj);
		}
		return false;
	}
}

module.exports = GamePlay;
