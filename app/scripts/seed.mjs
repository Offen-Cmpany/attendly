// Seed dummy data into Appwrite. Run after creating the collections per SETUP.md.
//   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
//   APPWRITE_PROJECT=xxx \
//   APPWRITE_DATABASE=yyy \
//   APPWRITE_API_KEY=zzz \
//   node scripts/seed.mjs
import { Client, Databases, ID } from 'node-appwrite';

const { APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_DATABASE, APPWRITE_API_KEY } = process.env;
if (!APPWRITE_PROJECT || !APPWRITE_DATABASE || !APPWRITE_API_KEY) {
  console.error('Missing env. See header of this file.');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1')
  .setProject(APPWRITE_PROJECT)
  .setKey(APPWRITE_API_KEY);

const db = new Databases(client);

const leaves = [
  { userId: 'u1', userName: 'Aravind R',  reg: 'CSE/22/041', type: 'duty',     reason: 'Hackstorm 2026 representation', fromDate: iso('2026-04-19'), toDate: iso('2026-04-19'), status: 'pending' },
  { userId: 'u2', userName: 'Lakshmi M',  reg: 'CSE/22/063', type: 'medical',  reason: 'Fever, advised rest 2 days',     fromDate: iso('2026-04-21'), toDate: iso('2026-04-22'), status: 'pending' },
  { userId: 'u3', userName: 'Sreehari V', reg: 'CSE/22/078', type: 'personal', reason: 'Family function',                 fromDate: iso('2026-04-23'), toDate: iso('2026-04-23'), status: 'pending' },
  { userId: 'u4', userName: 'Nithya K',   reg: 'CSE/22/021', type: 'duty',     reason: 'NSS camp coordination',          fromDate: iso('2026-04-25'), toDate: iso('2026-04-25'), status: 'pending' },
];

const subjects = [
  { code: 'CS301', name: 'Algorithms',          faculty: 'demo', credits: 4, semester: 6 },
  { code: 'CS303', name: 'Operating Systems',   faculty: 'demo', credits: 4, semester: 6 },
  { code: 'CS305', name: 'Compiler Design',     faculty: 'demo', credits: 3, semester: 6 },
  { code: 'CS307', name: 'OS Lab',              faculty: 'demo', credits: 2, semester: 6 },
];

function iso(d) { return new Date(d).toISOString(); }

async function seedCollection(id, items) {
  for (const item of items) {
    await db.createDocument(APPWRITE_DATABASE, id, ID.unique(), item);
    console.log(`  + ${id}: ${item.name ?? item.code ?? item.userName}`);
  }
}

(async () => {
  console.log('Seeding subjects…');
  await seedCollection('subjects', subjects);
  console.log('Seeding leaves…');
  await seedCollection('leaves', leaves);
  console.log('Done.');
})().catch(e => { console.error(e); process.exit(1); });
