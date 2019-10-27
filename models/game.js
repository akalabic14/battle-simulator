const { Schema, model } = require('mongoose');

const schema = new Schema({
	name: {
		type:String,
		required: true
	},
	armies: [{ type: Schema.Types.ObjectId, ref: 'Army' }],
	status: {
		type: String,
		enum: ['Pending', 'In progress', 'Finished'],
		default: 'Pending',
	},
	log: [String],
});

const Game = model('Game', schema);

module.exports = Game;
