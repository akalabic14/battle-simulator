const Game = require('../models/game');
const ArmyClass = require('./army');
const { promisfyMongoose } = require('./helper');
const { minArmiesLength } = require('../constants');


class GameClass {
	constructor({
		id, name, status, armies, logs,
	}) {
		this.id = id;
		this.name = name;
		this.status = status || 'Pending';
		this.armies = armies || [];
		this.logs = logs || [];
	}

	create(name) {
		return new Promise(async (resolve, reject) => {
			try {
				let game = new Game({
					name
				});
				game = await game.save()

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
				game.armies = this.armies.map(a => a.id);
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
			try {
				let Army = new ArmyClass({});
				Army =  await Army.create({
					name, units, strategy, game: this.id
				});
				this.armies.push(Army.id);
				this.logs.push(`Army ${name} joined the Game.`);
				await this.updateModel();
				resolve();
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	start() {
		return new Promise(async (resolve, reject) => {
			try {
				if (this.armies.length < minArmiesLength) {
					throw new Error('Not enough armies in game to start.');
				} else {
					this.status = 'In progress';
					this.logs.push('Game started.');
					await this.updateModel();
					resolve();
				}
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	toString() {
		return new Promise(async (resolve, reject) => {
			try {
				let allArmies = await Promise.all(this.armies.map(async id => {
					return new ArmyClass({}).recreateById(id)
				}))
				resolve(`Game: ${this.name}, Status: ${this.status}, Armies: \n ${allArmies.map(a => a.toString()).join('\n')}`)
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		})
		
	}
}

module.exports = GameClass;
