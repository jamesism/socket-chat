# Super simple chat server
[![Build Status](https://travis-ci.org/jamesism/socket-chat.svg?branch=master)](https://travis-ci.org/jamesism/badges)

This is a really basic socket.io chat server to be used for demo.

## Listens for:

### register
When you want to register a new user for the chat, emit the `register` event with an object payload keyed by desired user name.

`socket.emit('register', { name: "StanTheMan" });`

### message
This sends a message to the chat server. Emit the `message` event with a payload keyed by `text` that is the text of your message.

## Emits:

### init
This is emitted if you've registered or logged in successfully. The payload is an object that describes the current state of the chat.
```
	{
		users: [
			{
				id: {Number},
				name: {String},
				online: {Boolean}
			},
			...
		],
		messages: [
			.. the last 50 message objects
		],
		session: {
			.. your session information to store locally
		}
	}
```

### message
This is emitted if there is a new message to the chat server. The payload will be an object with the structure:

```
{
	id: <messageId> {Number},
	text: "The message text" {String},
	timestamp: <timestamp in millis> {Number},
	author: "Author user name" {String},
	author_id: <author_id> {Number}
}
```

### userchange
This is emitted if there is a change to the users connected to the server. The payload will be an object with the structure:
```
[{
	id: userId,
	name: username
}]
```

### chaterror
This is emitted if there is an error in something you tried to do. The payload will be a string describing the error.
