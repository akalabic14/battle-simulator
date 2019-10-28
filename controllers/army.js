const Army = require('../models/army');
const { promisfyMongoose } = require('./helper');

class ArmyClass {
	constructor({
		id, name, units, strategy, game, alive, health
	}) {
		this.id = id;
		this.name = name;
		this.units = units;
		this.health = health || units;
		this.strategy = strategy;
		this.game = game;
		this.alive = alive;
	}

	create({
		name, units, strategy, game,
	}) {
		return new Promise(async (resolve, reject) => {
			try {
				const army = new Army({
					name,
					units,
					strategy,
					game,
				});
				await army.save();
				resolve(new ArmyClass(army));
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	updateModel() {
		return new Promise(async (resolve, reject) => {
			try {
				if (this.health <= 0) {
					this.alive = false
					this.health = 0;
				};
				const army = await promisfyMongoose(Army.findById(this.id));
				army.name = this.name;
				army.units = this.units;
				army.health = this.health;
				army.strategy = this.strategy;
				army.game = this.game;
				army.alive = this.alive;
				army.save();
				resolve();
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	recreateById(id) {
		return new Promise(async (resolve, reject) => {
			try {
				const army = await promisfyMongoose(Army.findById(id));
				if (army) {
					resolve(new ArmyClass(army));
				} else {
					throw new Error('Army with that id not found');
				}
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
	}

	getAllFromGame(gameId) {
		return new Promise(async (resolve, reject) => {
			try {
				let armies = await Army.find({game: gameId});
				if (armies) {
					resolve(armies.map(army => new ArmyClass(army)))
				} else {
					resolve([])
				}
			} catch (e) {
				logger.error(e);
				reject(e);
			}
		})
	}

	toString() {
		return `Army: ${this.name}, Total Units: ${this.units}, Total Alive: ${this.health}, Strategy: ${this.strategy}`;
	}

	attack(opponent, game) {
		return new Promise(async (resolve, reject) => {
			try {
				let chanse = Math.random();
				logger.debug(`Army ${this.name} got ${chanse}, and needs ${1/this.health} to success`);
				if (chanse > 1/this.health) {
					opponent.health -= this.units / 2;
					await opponent.updateModel();
					if (!opponent.alive) {
						logger.info(`Army ${this.name} destroyed Army ${opponent.name}!`);
						game.logs.push(`Army ${this.name} destroyed Army ${opponent.name}!`)
						if (game.armies.filter(a => a.alive).length < 2) {
							game.status = 'Finished';
							logger.info(`Army ${this.name} has won the war!`);
							game.logs.push(`Army ${this.name} has won the war!`)
						}
					} else {
						logger.info(`Army ${this.name} had success with attack on Army ${opponent.name}!`);
						game.logs.push(`Army ${this.name} had success with attack on Army ${opponent.name}!`);
					}
				} else {
					logger.info(`Army ${opponent.name} managed to defend from Army ${this.name}!`);
					game.logs.push(`Army ${opponent.name} managed to defend from Army ${this.name}!`);
				}
				await game.updateModel();
				resolve();
			} catch (e) {
				logger.error(e);
				reject(e);
			}
		})
	}

	scheduleAttack(game, interval) {
		setTimeout(async () => {
				if (this.alive) {
					let opponent = this.whoToAttack(game.armies.filter(a => a != this && a.alive));
					logger.info(`Army ${this.name} is attacking Army ${opponent.name}!`);
					game.logs.push(`Army ${this.name} is attacking Army ${opponent.name}!`);
					await game.updateModel();
					await this.attack(opponent, game);
					if (game.status == 'In progress') {
						this.nextAttack = new Date(Date.now() + this.units * 10);
						this.scheduleAttack(game, this.units * 10)
					}
				}
		}, interval)
	}

	whoToAttack (opponents) {
		switch (this.strategy) {
			case 'Random':
				return opponents[Math.floor(opponents.length * Math.random())]
			case 'Weakest':
				return opponents.sort((a, b) => a.health - b.health)[0]
			case 'Strongest':
					return opponents.sort((a, b) => b.health - a.health)[0]
		}
	}
}

module.exports = ArmyClass;
