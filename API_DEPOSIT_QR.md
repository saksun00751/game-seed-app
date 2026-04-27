# API Flow - สร้าง QR สำหรับชำระเงิน (Payment Deposit)

## Step 1: สร้างรายการฝากเงิน

ใช้ `bankId` จาก `bank.id` ที่ได้จาก `POST /api/v1/deposit/loadbank` เช่น `smkpay`

### Request

```json
{
  "method": "POST",
  "url": "/api/{bankId}/deposit/create",
  "headers": {
    "Content-Type": "application/json",
    "Cookie": "token=xxxxx"
  },
  "body": {
    "amount": 100.00
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "request_id": "REQ20260428123456",
    "txid": "TXN987654321001",
    "status": "pending",
    "amount": 100.00,
    "payamount": 100.00,
    "message": "สร้างรายการสำเร็จ"
  }
}
```

---

## Step 2: ดึง QR Code

### Request

```json
{
  "method": "GET",
  "url": "/api/{bankId}/qrcode/REQ20260428123456",
  "headers": {
    "Cookie": "token=xxxxx"
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "request_id": "REQ20260428123456",
    "txid": "TXN987654321001",
    "status": "pending",
    "amount": 100.00,
    "payamount": 100.00,
    "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/nhe...",
    "qr_string": "00020101021229370016A000000677010112662200213330016A000000677010712000213330009A9993605802TH5913DEMO TEST6009BANGKOK621405280610123456370413QR1234567890123",
    "expired_date": "2026-04-28 14:35:45",
    "member": {
      "user_name": "user123",
      "name": "นางสาว สมหญิง"
    }
  }
}
```

---

## Step 3: Check Payment Status (Polling)

### Request

```json
{
  "method": "GET",
  "url": "/api/{bankId}/deposit/status/TXN987654321001",
  "headers": {
    "Cookie": "token=xxxxx"
  }
}
```

### Response (เมื่อยังไม่ได้ชำระ)

```json
{
  "success": true,
  "data": {
    "txid": "TXN987654321001",
    "status": "pending",
    "amount": 100.00,
    "payment_status": "waiting_payment"
  }
}
```

### Response (เมื่อชำระสำเร็จ)

```json
{
  "success": true,
  "data": {
    "txid": "TXN987654321001",
    "status": "success",
    "amount": 100.00,
    "payment_status": "paid",
    "paid_date": "2026-04-28 14:28:30"
  }
}
```

### Response (เมื่อหมดอายุ)

```json
{
  "success": true,
  "data": {
    "txid": "TXN987654321001",
    "status": "expired",
    "amount": 100.00,
    "payment_status": "expired"
  }
}
```

---

## Error Response Examples

### ไม่พบ Token (Unauthorized)

```json
{
  "success": false,
  "message": "กรุณาเข้าสู่ระบบ",
  "status": 401
}
```

### Request Body ไม่ถูกต้อง

```json
{
  "success": false,
  "message": "ข้อมูลไม่ถูกต้อง",
  "status": 400
}
```

### Request ID ไม่พบ

```json
{
  "success": false,
  "message": "ไม่พบ request_id",
  "status": 400
}
```

### Server Error

```json
{
  "success": false,
  "message": "ไม่สามารถสร้างรายการฝากเงินได้",
  "status": 500
}
```
