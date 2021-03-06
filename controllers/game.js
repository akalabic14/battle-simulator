const Game = require('../models/game');
const ArmyClass = require('./army');
const { promisfyMongoose } = require('./helper');
const { minArmiesLength } = require('../constants');


class GameClass {
	constructor({
		_id, name, status, armies, logs,
	}) {
		this.id = _id;
		this.name = name;
		this.status = status || 'Pending';
		this.armies = armies || [];
		this.logs = logs || [];
	}

	create(name) {
		return new Promise(async (resolve, reject) => {
			try {
				let game = new Game({
					name,
				});
				game = await game.save();

				resolve(new GameClass(game));
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	recreateById(id) {
		return new Promise(async (resolve, reject) => {
			try {
				const game = await promisfyMongoose(Game.findById(id));
				if (game) {
					game.armies = await new ArmyClass({}).getAllFromGame(game.id);
					resolve(new GameClass(game));
				} else {
					throw new Error(`Game with id ${id} does not exist`);
				}
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	updateModel() {
		return new Promise(async (resolve, reject) => {
			try {
				const game = await promisfyMongoose(Game.findById(this.id));
				game.name = this.name;
				game.status = this.status;
				game.logs = this.logs;
				await game.save();
				resolve();
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	addArmy({ name, units, strategy }) {
		return new Promise(async (resolve, reject) => {
			if (this.status === 'Pending') {
				try {
					let Army = new ArmyClass({});
					Army = await Army.create({
						name, units, strategy, game: this.id,
					});
					this.armies.push(Army);
					this.logs.push(`Army ${name} joined the Game.`);
					await this.updateModel();
					resolve();
				} catch (e) {
					global.logger.error(e);
					reject(e);
				}
			} else {
				reject(new Error(`Game already ${this.status === 'In progress' ? 'started.' : 'finished.'}`));
			}
		});
	}

	start() {
		return new Promise(async (resolve, reject) => {
			if (this.status === 'Pending') {
				try {
					if (this.armies.length < minArmiesLength) {
						throw new Error('Not enough armies in game to start.');
					} else {
						this.status = 'In progress';
						this.logs.push('Game started.');
						await this.updateModel();
						this.armies.forEach((army) => {
							army.scheduleAttack(this, 0);
						});
						resolve();
					}
				} catch (e) {
					global.logger.error(e);
					reject(e);
				}
			} else {
				reject(new Error(`Game already ${this.status}` === 'In progress' ? 'started.' : 'finished.'));
			}
		});
	}

	restart() {
		return new Promise(async (resolve, reject) => {
			try {
				await Promise.all(this.armies.map((army) => {
					army.health = army.units;
					army.alive = true;
					return army.updateModel();
				}));
				this.status = 'Pending';
				this.logs.push('Game restarted!');
				await this.updateModel();
				resolve('ok');
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	toString() {
		return new Promise(async (resolve, reject) => {
			try {
				resolve(`Game: ${this.name}, Status: ${this.status}, \n Armies: \n ${this.armies.map((a) => a.toString()).join('\n')}`);
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	toJson() {
		const armiesHash = {};
		this.armies.forEach((army) => {
			armiesHash[army.id] = army.toJson();
		});
		return {
			status: this.status,
			logs: this.logs,
			armies: armiesHash,
		};
	}
}

module.exports = GameClass;
