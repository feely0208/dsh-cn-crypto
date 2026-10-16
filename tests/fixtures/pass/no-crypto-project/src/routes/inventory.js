// 库存数据的查询与排序
import dayjs from 'dayjs';

const SORTABLE = ['sku', 'quantity', 'updatedAt'];

export async function listStock({ warehouse, keyword, page }) {
  const rows = await query('inventory', { warehouse, keyword });
  return rows
    .filter((row) => row.quantity > 0)
    .slice((page - 1) * 20, page * 20)
    .map((row) => ({ ...row, updatedAt: dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm') }));
}

export async function getItem(sku) {
  const rows = await query('inventory', { sku });
  return rows[0] || null;
}

export function sortRows(rows, field, direction = 'asc') {
  if (!SORTABLE.includes(field)) throw new Error(`unsupported sort field: ${field}`);
  const factor = direction === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => (a[field] > b[field] ? factor : -factor));
}

async function query(table, filters) {
  const conditions = Object.entries(filters).filter(([, v]) => v != null);
  const where = conditions.map(([k], i) => `${k} = $${i + 1}`).join(' AND ');
  const values = conditions.map(([, v]) => v);
  return db.select(table, where, values);
}

const db = {
  async select(table, where, values) {
    console.log(`select from ${table}${where ? ' where ' + where : ''}`, values);
    return [{ sku: 'SKU-1001', quantity: 12, updatedAt: new Date().toISOString() }];
  },
};
