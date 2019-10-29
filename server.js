const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');

const logger = require('tracer').colorConsole({
	format: '{{timestamp}} [{{title}}] {{message}} ({{file}}:{{line}})',
	dateformat: 'd mmm yy HH:MM:ss',
});

global.logger = logger;

const GamePlay = require('./controllers/gameplay');
const router = require('./routers/play');

const port = process.env.PORT || 8080;
const app = express();
const gameplay = new GamePlay();

mongoose.connect('mongodb+srv://web_tehnologije:web_tehnologije@golux-9u8hn.mongodb.net/battles?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		app.use(bodyParser.json());

		app.post('/play/:method', router);

		return gameplay.init();
	})
	.then(() => {
		global.gameplay = gameplay;
		app.listen(port, () => {
			global.logger.info(`Server online at port ${port}`);
		});
	})
	.catch((err) => {
		global.logger.error(err);
		process.exit(0);
	});

process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, err) {
	if (gameplay.toString()) {
		fs.writeFileSync('./recover.json', gameplay.toString());
	}
	if (err) logger.error(err);
	if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{exit: true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
