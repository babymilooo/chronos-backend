const Agenda = require('agenda');
const mongoose = require('mongoose');

const agenda = new Agenda({ mongo: mongoose.connection.getClient().db() });

// Define jobs
agenda.define('example job', async job => {
  // Job details here
});

const startAgenda = async () => {
  await agenda.start();
  // Schedule jobs here
};

module.exports = { startAgenda, agenda };
