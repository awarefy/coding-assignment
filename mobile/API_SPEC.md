# 時限 Chat API 仕様書

## 基本情報

- Base URL: `https://api.ephemeral.chat/v1`
- 認証: Bearer Token
- レスポンス形式: JSON
- 時刻表記: ISO 8601 UTC（例: `2024-01-20T10:00:00Z`）

## エンドポイント一覧

### 1. メッセージ送信

```
POST /messages

```

**リクエスト:**

```json
{
  "recipient_id": "user123",
  "content": "Hello!"
}
```

**レスポンス:**

```json
{
  "message_id": "msg_abc123",
  "sent_at": "2024-01-20T10:00:00Z",
  "expires_at": "2024-01-21T10:00:00Z"
}
```

### 2. メッセージ取得

```
GET /messages?chat_id={chat_id}&before={timestamp}&limit={limit}

```

**クエリ仕様:**

- `before`: `sent_at` の上限（この時刻より前のメッセージを返す）
- `limit`: 1〜50（省略時は 20）
- ソート順: `sent_at` 降順

**レスポンス:**

```json
{
  "messages": [
    {
      "message_id": "msg_abc123",
      "sender_id": "user456",
      "content": "Hello!",
      "sent_at": "2024-01-20T10:00:00Z",
      "expires_at": "2024-01-21T10:00:00Z",
      "read_at": null,
      "is_expired": false
    }
  ],
  "has_more": true
}
```

**補足:**

- `is_expired` はサーバー時刻基準で判定済みの値

### 3. 既読状態更新

```
PUT /messages/{message_id}/read

```

**リクエスト:**

```json
{
  "displayed_duration_ms": 3500, // 連続して表示された時間
  "viewport_exposure": 0.8 // 連続して表示された割合（0.0-1.0）
}
```

**レスポンス:**

```json
{
  "read_at": "2024-01-20T10:05:00Z",
  "expires_at": "2024-01-20T11:05:00Z" // 既読から1時間後
}
```

**補足:**

- クライアントは「表示率 80% 以上が 3 秒連続」を満たしたタイミングで 1 回だけ本 API を呼び出す
- 既読済みメッセージへの再送は冪等（同じ `read_at` / `expires_at` を返す）

### 4. チャット一覧取得

```
GET /chats

```

**レスポンス:**

```json
{
  "chats": [
    {
      "chat_id": "chat_xyz789",
      "other_user": {
        "user_id": "user456",
        "username": "alice",
        "avatar_url": "https://..."
      },
      "last_message": {
        "content": "Hello!",
        "sent_at": "2024-01-20T10:00:00Z",
        "is_expired": false
      },
      "unread_count": 3
    }
  ]
}
```

## エラーレスポンス

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded"
  }
}
```

**エラーコード一覧:**

- `UNAUTHORIZED`: 認証エラー
- `MESSAGE_NOT_FOUND`: メッセージが見つからない
- `MESSAGE_EXPIRED`: メッセージは既に消去済み
- `RATE_LIMIT_EXCEEDED`: レート制限
- `INVALID_REQUEST`: リクエストパラメータ不正
