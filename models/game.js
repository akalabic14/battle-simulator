const { Schema, model } = require('mongoose');

const schema = new Schema({
	name: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ['Pending', 'In progress', 'Finished'],
		default: 'Pending',
	},
	logs: [String],
});

const Game = model('Game', schema);

module.exports = Game;
