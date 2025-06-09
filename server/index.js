import express from 'express';
import fs from 'fs';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = new URL('./data.json', import.meta.url);

app.use(cors());
app.use(express.json());

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generic handlers
function createRouter(key) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const data = readData();
    res.json(data[key]);
  });

  router.post('/', (req, res) => {
    const data = readData();
    let item = { id: Date.now().toString(), ...req.body };

    // Add default fields for new clients
    if (key === 'clients') {
      item = {
        createdAt: new Date().toISOString(),
        totalInvoices: 0,
        totalCosts: 0,
        totalProfit: 0,
        ...item
      };
    }

    data[key].push(item);
    writeData(data);
    res.status(201).json(item);
  });

  router.put('/:id', (req, res) => {
    const data = readData();
    const index = data[key].findIndex(i => i.id === req.params.id);
    if (index === -1) return res.sendStatus(404);
    data[key][index] = { ...data[key][index], ...req.body };
    writeData(data);
    res.json(data[key][index]);
  });

  router.delete('/:id', (req, res) => {
    const data = readData();
    data[key] = data[key].filter(i => i.id !== req.params.id);
    writeData(data);
    res.sendStatus(204);
  });

  return router;
}

app.use('/clients', createRouter('clients'));
app.use('/invoices', createRouter('invoices'));
app.use('/costs', createRouter('costs'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
