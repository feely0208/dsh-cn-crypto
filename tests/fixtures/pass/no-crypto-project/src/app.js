// 库存查询服务入口
import express from 'express';
import { listStock, getItem } from './routes/inventory.js';

const app = express();
app.use(express.json());

app.get('/items', async (req, res) => {
  const { warehouse, keyword, page } = req.query;
  const rows = await listStock({ warehouse, keyword, page: Number(page || 1) });
  res.json({ code: 0, data: rows, total: rows.length });
});

app.get('/items/:sku', async (req, res) => {
  const item = await getItem(req.params.sku);
  if (!item) {
    res.status(404).json({ code: 404, message: 'sku not found' });
    return;
  }
  res.json({ code: 0, data: item });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`inventory-api listening on ${port}`);
});
