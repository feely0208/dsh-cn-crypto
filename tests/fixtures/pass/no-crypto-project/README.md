# 库存查询服务

一个只读的库存查询接口：按仓库和关键字过滤，返回分页结果。

- `GET /items?warehouse=&keyword=&page=` —— 列表
- `GET /items/:sku` —— 单个 SKU 详情

排序字段白名单在 `src/routes/inventory.js` 的 `SORTABLE` 里维护。
