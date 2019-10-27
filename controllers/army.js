const Army = require('../models/army');
const { promisfyMongoose } = require('./helper');

class ArmyClass {
	constructor({
		id, name, units, strategy, game, alive,
	}) {
		this.id = id;
		this.name = name;
		this.units = units;
		this.health = units;
		this.strategy = strategy;
		this.game = game;
		this.alive = alive;
	}

	create({
		name, units, strategy, game,
	}) {
		return new Promise(async (resolve, reject) => {
			try {
				let army = new Army({
					health: units,
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
				const army = await promisfyMongoose(Army.findById(this.id));
				army.name = this.name;
				army.units = this.units;
				army.health = this.units;
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
				resolve(new ArmyClass(army));
			} catch (e) {
				global.logger.error(e);
				reject(e);
			}
		});
    }
    
    toString() {
        return `Army: ${this.name}, Total Units: ${this.units}, Total Alive: ${this.health}, Strategy: ${this.strategy}`
    }
}

module.exports = ArmyClass;
