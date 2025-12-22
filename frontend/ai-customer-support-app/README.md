# AI Customer Support App

このリポジトリでは、MSW (Mock Service Worker) を使用してAIチャットのAPIをモックし、Vitestを使用してテストを実装しています。
サンプルコードとして提供していますので、実際の使用は任意です。

## 使用技術

- [MSW (Mock Service Worker)](https://mswjs.io/) - APIのモック
- [Vitest](https://vitest.dev/) - テストフレームワーク

## セットアップ

依存関係をインストールするには以下のコマンドを実行します：

```bash
pnpm install
```

## テストの実行

テストを実行するには以下のコマンドを使用します：

```bash
# 一回だけテストを実行
pnpm test

# ウォッチモードでテストを実行（ファイル変更時に自動実行）
pnpm test:watch
```

## モックAPIエンドポイント

このプロジェクトでは以下のAPIエンドポイントがモックされています：

### POST /api/chat

ユーザーのチャットメッセージを送信して、AIアシスタントのレスポンスを受け取るエンドポイント。

#### リクエスト仕様

- Content-Type: `application/json`
- ボディ: `ChatRequest` 型に準拠したJSONオブジェクト

```typescript
interface ChatRequest {
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
```

#### リクエスト例

```json
{
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Hello, can you help me with something?"
    }
  ]
}
```

#### レスポンス仕様

- Content-Type: `application/json`
- ステータスコード: 200（成功時）
- ボディ: `ChatResponse` 型に準拠したJSONオブジェクト

```typescript
interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string; // AIResponseContentがJSON文字列化されたもの
}

interface AIResponseContent {
  response: string;
  suggested_questions: string[];
}
```

#### レスポンス例

```json
{
  "id": "generated-uuid",
  "role": "assistant",
  "content": "{\"response\":\"Yes, I'd be happy to help. What would you like to know?\",\"suggested_questions\":[\"Tell me about your services\",\"I need help with my account\",\"What are your business hours?\"]}"
}
```

#### 特殊な動作

- メッセージに「long」という単語が含まれる場合、応答は3秒の遅延後に返されます。
- メッセージの内容に応じて異なる応答が生成されます：
  - 「hello」: 挨拶と一般的な質問の提案
  - 「help」: 手助けの提案
  - 「list」: Markdownリストの例を含む応答

### GET /api/chat/messages

過去のチャット履歴を取得するエンドポイント。

#### レスポンス仕様

- Content-Type: `application/json`
- ステータスコード: 200（成功時）
- ボディ: `MessagesResponse` 型に準拠したJSONオブジェクト

```typescript
interface MessagesResponse {
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
```

#### レスポンス例

```json
{
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Hello, can you help me with something?"
    },
    {
      "id": "msg_2",
      "role": "assistant",
      "content": "{\"response\":\"Yes, I'd be happy to help. What would you like to know?\",\"suggested_questions\":[\"Tell me about your services\",\"I need help with my account\",\"What are your business hours?\"]}"
    },
    {
      "id": "msg_3",
      "role": "user", 
      "content": "How do I create a markdown list?"
    },
    {
      "id": "msg_4",
      "role": "assistant",
      "content": "{\"response\":\"Here's a markdown list example:\\n- Item 1\\n- Item 2\\n- Item 3\",\"suggested_questions\":[\"Can you add more items?\",\"Show me a numbered list\",\"How do I create nested lists?\"]}"
    }
  ]
}
```
