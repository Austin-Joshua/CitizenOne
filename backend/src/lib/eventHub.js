const { EventEmitter } = require('events');

/** In-process pub/sub for SSE. Replace with Redis pub/sub when horizontally scaling API instances. */
const eventHub = new EventEmitter();
eventHub.setMaxListeners(500);

function broadcastWorkspace(payload) {
  eventHub.emit('workspace', payload);
}

module.exports = { eventHub, broadcastWorkspace };
