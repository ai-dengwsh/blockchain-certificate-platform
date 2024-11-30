# API接口文档

## 1. 接口规范

### 1.1 基础信息
- 基础URL: `http://localhost:3000/api`
- 请求头: 
  ```
  Content-Type: application/json
  Authorization: Bearer <token>  // 需要认证的接口
  ```

### 1.2 响应格式
```json
{
  "code": 200,          // 状态码
  "message": "success", // 提示信息
  "data": {}           // 响应数据
}
```

### 1.3 错误码说明
- 200: 成功
- 400: 请求参数错误
- 401: 未认证
- 403: 无权限
- 404: 资源不存在
- 500: 服务器错误

## 2. 认证接口

### 2.1 用户注册
- 请求路径：POST /auth/register
- 请求参数：
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "walletAddress": "string"
}
```
- 响应数据：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "number",
    "username": "string",
    "token": "string"
  }
}
```

### 2.2 用户登录
- 请求路径：POST /auth/login
- 请求参数：
```json
{
  "username": "string",
  "password": "string"
}
```
- 响应数据：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "string",
    "userInfo": {
      "userId": "number",
      "username": "string",
      "walletAddress": "string"
    }
  }
}
```

## 3. 凭证管理接口

### 3.1 创建凭证
- 请求路径：POST /certificates/create
- 请求头：需要认证
- 请求参数：
```json
{
  "ipfsHash": "string",
  "metadata": {
    "name": "string",
    "description": "string",
    "attributes": []
  }
}
```
- 响应数据：
```json
{
  "code": 200,
  "message": "凭证创建成功",
  "data": {
    "tokenId": "number",
    "txHash": "string"
  }
}
```

### 3.2 获取凭证列表
- 请求路径：GET /certificates/list
- 请求头：需要认证
- 请求参数：
```json
{
  "page": "number",
  "pageSize": "number",
  "status": "string?", // valid/invalid
  "owner": "string?"   // 钱包地址
}
```
- 响应数据：
```json
{
  "code": 200,
  "data": {
    "total": "number",
    "items": [{
      "tokenId": "number",
      "ipfsHash": "string",
      "owner": "string",
      "status": "string",
      "createTime": "string"
    }]
  }
}
```

## 4. 交易市场接口

### 4.1 创建挂单
- 请求路径：POST /market/list
- 请求头：需要认证
- 请求参数：
```json
{
  "tokenId": "number",
  "price": "string",    // ETH金额
  "description": "string?"
}
```
- 响应数据：
```json
{
  "code": 200,
  "data": {
    "listingId": "number",
    "txHash": "string"
  }
}
```

### 4.2 获取市场列表
- 请求路径：GET /market/listings
- 请求参数：
```json
{
  "page": "number",
  "pageSize": "number",
  "status": "string?",  // active/sold/canceled
  "minPrice": "string?",
  "maxPrice": "string?"
}
```
- 响应数据：
```json
{
  "code": 200,
  "data": {
    "total": "number",
    "items": [{
      "listingId": "number",
      "tokenId": "number",
      "seller": "string",
      "price": "string",
      "status": "string"
    }]
  }
}
```

## 5. 账户管理接口

### 5.1 获取账户信息
- 请求路径：GET /account/info
- 请求头：需要认证
- 响应数据：
```json
{
  "code": 200,
  "data": {
    "ethBalance": "string",
    "tokenBalance": "string",
    "walletAddress": "string",
    "transactions": [{
      "txHash": "string",
      "type": "string",
      "amount": "string",
      "status": "string",
      "timestamp": "string"
    }]
  }
}
```

### 5.2 充值记录
- 请求路径：POST /account/deposit
- 请求头：需要认证
- 请求参数：
```json
{
  "amount": "string",
  "txHash": "string"
}
```
- 响应数据：
```json
{
  "code": 200,
  "data": {
    "recordId": "number",
    "status": "string"
  }
}
```

## 6. 文件系统接口

### 6.1 上传文件
- 请求路径：POST /files/upload
- 请求头：需要认证
- 请求参数：multipart/form-data
```
file: File
```
- 响应数据：
```json
{
  "code": 200,
  "data": {
    "ipfsHash": "string",
    "url": "string"
  }
}
```

### 6.2 获取文件信息
- 请求路径：GET /files/:ipfsHash
- 响应数据：
```json
{
  "code": 200,
  "data": {
    "ipfsHash": "string",
    "mimeType": "string",
    "size": "number",
    "url": "string"
  }
}
```

## 7. 支付接口

### 7.1 创建支付订单
- 请求路径：POST /payment/create
- 请求头：需要认证
- 请求参数：
```json
{
  "amount": "string",
  "type": "string",    // alipay/wechat
  "description": "string"
}
```
- 响应数据：
```json
{
  "code": 200,
  "data": {
    "orderId": "string",
    "payUrl": "string"
  }
}
```

### 7.2 查询支付状态
- 请求路径：GET /payment/:orderId/status
- 请求头：需要认证
- 响应数据：
```json
{
  "code": 200,
  "data": {
    "orderId": "string",
    "status": "string",
    "paidTime": "string?"
  }
}
```
