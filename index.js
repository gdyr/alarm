// Imports
const Express = require('express');
const Bull = require('bull');
const OMX = require('node-omxplayer');
const bodyParser = require('body-parser');

/* ALARM SYSTEM */

// Job Queue
const queue = new Bull('alarms');

// Audio Player
queue.process(async (job) => {
  OMX(job.data.path, 'both');
});


/* WEB API */

// Server
const app = Express();
app.listen(8080);

// Get alarms
app.get('/alarms', async (req, res) => {
  res.send(await queue.getRepeatableJobs());
});

// Add alarm
app.post('/alarms', bodyParser.json(), async (req, res) => {
  res.send(await queue.add({ path: req.body.path }, { repeat: { cron: req.body.time } }));
});

// Remove alarm
app.delete('/alarms/:id', async (req, res) => {
  queue.removeRepeatableByKey(req.params.id).then(
    () => { res.send('OK'); },
    () => { res.sendStatus(404); }
  );
});
