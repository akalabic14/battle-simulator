const { Schema, model } = require('mongoose');

const schema = new Schema({
	name: String,
	units: {
		type: Number,
		min: [80, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'],
		max: [100, 'The value of path `{PATH}` ({VALUE}) exceeds the limit ({MAX}).'],
	},
	health: {
		type: Number,
		min: [0, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'],
		max: [100, 'The value of path `{PATH}` ({VALUE}) exceeds the limit ({MAX}).'],
	},
	strategy: {
		type: String,
		enum: ['Random', 'Weakest', 'Strongest'],
	},
	status: {
		type: String,
		enum: ['Available', 'In game', 'Defeated'],
	},
	Game: { type: Schema.Types.ObjectId, ref: 'Game' },
});

const Army = model('Army', schema);

module.exports = Army;
