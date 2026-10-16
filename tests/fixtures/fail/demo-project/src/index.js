// 订单网关入口
import express from 'express';
import { encryptCardNo, encryptMerchantNo, newRequestId, signOrder } from './crypto/payment-crypto.js';

const app = express();
app.use(express.json());

app.post('/orders', (req, res) => {
  const { orderNo, amount, merchantNo, cardNo } = req.body;
  const requestId = newRequestId();
  const payload = {
    requestId,
    merchantNo: encryptMerchantNo(merchantNo),
    cardNo: encryptCardNo(cardNo),
    sign: signOrder(orderNo, amount),
  };
  res.json({ code: 0, data: payload });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`order-gateway listening on ${port}`);
});
