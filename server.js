const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const port = process.env.PORT || 8080;
const app = express();

global.logger = require('tracer').colorConsole({ // .console({
    format: '{{timestamp}} [{{title}}] {{message}} ({{file}}:{{line}})',
    dateformat: 'd mmm yy HH:MM:ss'
})

app.use(bodyParser.json())

mongoose.connect('mongodb+srv://web_tehnologije:web_tehnologije@golux-9u8hn.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    app.listen(port, () => {
        logger.info(`Server online at port ${port}`);
    });
})
.catch(err => {
    logger.error(`Database failed to connect. ${err.toString()}`);
    process.exit(0);
})