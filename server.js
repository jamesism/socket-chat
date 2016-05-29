'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = 3000;
const PREV_MESSAGE_BUFFER = 50;
const PUBLIC_DIR = __dirname + '/public';

server.listen(PORT);

app.use('/', express.static(PUBLIC_DIR));

const log = console.log;

const events = {
	INIT: "init",
	ERROR: "chaterror",
	USERS: "userchange",
	MESSAGE: "message",
	REGISTER: "register"
};

const errors = {
	NO_ID: "You didn't provide a valid user id.",
	NO_NAME: "You didn't provide a user name.",
	INVALID_ID: "User id provided is not valid.",
	NAME_TAKEN: "Someone already took that name. Sorry.",
	EXISTING_SESSION: "You're already logged in, maybe reconnect."
};

let users = [];
let messages = [];

let userId = 0;
let messageId = 0;

const addMessage = (message, author) => {
	message.id = ++messageId;
	message.timestamp = Date.now();
	message.author = author.name;
	message.author_id = author.id;
	messages.push(message);
	if (messages.length > PREV_MESSAGE_BUFFER) messages.shift();
	return message;
};

const addUser = user => {
	if (!user || !user.name) return false;

	let existing = users.find(u => u.name === user.name);
	if (existing) return false;

	user.id = ++userId;
	user.online = true;
	users.push(user);
	return user;
};


io.on('connection', socket => {
	log('CONNECTED');
	let session = false;
	let emitError = (msg) => socket.emit(events.ERROR, msg);

	socket.on(events.MESSAGE, message => {
		log('MESSAGE', message.text);
		let addedMessage = addMessage(message, session);
		socket.broadcast.emit(events.MESSAGE, addedMessage);
		socket.emit(events.MESSAGE, addedMessage);
	});

	socket.on(events.REGISTER, toRegister => {
		log('REGISTER', toRegister.name);
		toRegister = toRegister || {};
		if (session) return emitError(errors.EXISTING_SESSION);
		if (!toRegister.name) return emitError(errors.NO_NAME);

		let user = addUser(toRegister);
		if (!user) return emitError(errors.NAME_TAKEN);

		session = user;
		socket.emit(events.INIT, { session, users, messages });
		socket.broadcast.emit(events.USERS, users);
	});

	socket.on('disconnect', () => {
		if (!session) return;
		log('DISCONNECT', session.name);

		users = users.filter(u => u.id !== session.id);
		socket.broadcast.emit(events.USERS, users);
	});
});
