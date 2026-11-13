const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory database - stays alive while Render is ON
let orgs = {};    // { code: { code, name, createdAt } }
let members = {}; // { code: { code, name, orgCode, createdAt } }
let glances = {}; // { orgCode: [ { id, title, videoUrl, orgCode, createdAt } ] }

app.get('/', (req, res) => {
  res.send('GlanceLearn Cloud is ACTIVE ✅');
});

// ---------- ORGS ----------

// Admin creates org
app.post('/addOrg', (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.json({ success: false, message: 'Missing code or name' });
  orgs[code] = { code, name, createdAt: new Date().toISOString() };
  res.json({ success: true, org: orgs[code] });
});

// Member / anyone checks org
app.get('/getOrg/:code', (req, res) => {
  const org = orgs[req.params.code];
  if (!org) return res.json({ found: false });
  res.json({ found: true, org });
});

// ---------- MEMBERS ----------

// Admin adds member
app.post('/addMember', (req, res) => {
  const { code, name, orgCode } = req.body;
  if (!code || !name || !orgCode) return res.json({ success: false, message: 'Missing code, name or orgCode' });
  if (!orgs[orgCode]) return res.json({ success: false, message: 'Org not found' });
  members[code] = { code, name, orgCode, createdAt: new Date().toISOString() };
  res.json({ success: true, member: members[code] });
});

// Member checks self
app.get('/getMember/:code', (req, res) => {
  const member = members[req.params.code];
  if (!member) return res.json({ found: false });
  res.json({ found: true, member });
});

// ---------- GLANCES / VIDEOS ----------

// Admin uploads glance (video link)
app.post('/addGlance', (req, res) => {
  const { orgCode, title, videoUrl } = req.body;
  if (!orgCode || !title || !videoUrl) return res.json({ success: false, message: 'Missing orgCode, title or videoUrl' });
  if (!orgs[orgCode]) return res.json({ success: false, message: 'Org not found' });
  if (!glances[orgCode]) glances[orgCode] = [];
  const glance = { id: Date.now().toString(), orgCode, title, videoUrl, createdAt: new Date().toISOString() };
  glances[orgCode].push(glance);
  res.json({ success: true, glance });
});

// Member gets all glances for org
app.get('/getGlances/:orgCode', (req, res) => {
  const list = glances[req.params.orgCode] || [];
  res.json({ found: true, glances: list });
});

// ---------- START ----------

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('GlanceLearn running on port ' + PORT);
});