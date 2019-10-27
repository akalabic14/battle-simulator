const { Schema, model } = require('mongoose');

const schema = new Schema({
	name: String,
	armies: [{ type: Schema.Types.ObjectId, ref: 'Army' }],
	status: {
		type: String,
		enum: ['Pending', 'In progress', 'Finished'],
	},
	log: [String],
});

const Army = model('Army', schema);

module.exports = Army;
