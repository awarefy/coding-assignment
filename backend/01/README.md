# 課題の概要

ECプラットフォームからのWebhookイベントを受け取り、適切に処理するAPIエンドポイントを実装してください。このエンドポイントは、注文作成イベントを受信し、アプリケーションのDBに保存します。

実装に使用するプログラミング言語は問いません。

**想定所要時間**: 4時間

## 要件

### Webhookエンドポイントの実装

- HTTP POSTリクエストを受け付けるAPIエンドポイントを実装してください
- エンドポイントは `/api/store/webhook` とします

### 認証とセキュリティ

- [HMAC](https://datatracker.ietf.org/doc/html/rfc2104)-SHA256を使用してリクエストの真正性を確認してください
- 秘密鍵は `store-event-webhook-receiver/.env` に保存してあります
- 署名はWebhookイベントのリクエストヘッダーから取得できます

### イベント処理

- 受信するイベントのトピックは注文作成のみです
- イベントの種類(トピック)に対するフィルタリング処理の考慮は不要です
- Webhookのイベントは重複して送られてくることがあります
  - 同一イベントかどうかは、リクエストヘッダーの `X-Store-Event-Id` から判別可能です

### データ抽出と変換

- Webhookペイロードからイベントデータを抽出し、適切なモデル形式に変換してください

### モデル

アプリケーション内で使用するデータモデルを定義してください。最低限、以下の情報を永続化する必要があります。

- **ユーザー**: アプリケーション固有のユーザー情報を管理します。`app_user_id` を含む顧客の識別情報、ユーザー種別（例：通常、プレミアム）などを考慮してください。
- **ユーザー属性マスタ**: ユーザー種別（例：`Regular`, `Premium`）とその説明などを管理します。初期データとして、`Regular` (Standard user account) と `Premium` (Premium user account) の登録を想定しています。
- **Webhookイベントデータ**: 受信したWebhookイベントの詳細を記録します。イベントの一意なID (`X-Store-Event-Id`)、Webhookサービスから提供されるID (`X-Store-Webhook-Id`)、イベントトピック、イベント発生時刻、そして元のペイロード全体などを保存できるようにしてください。

### データベース保存

- イベント情報をデータベースに保存してください
- 冪等性を確保するため、同じイベントIDが既に存在する場合は処理をスキップしてください

### レスポンス

- 処理の成功・失敗に応じて、Webhookサービスに適切なレスポンスを返してください
- 例:
  - 成功時（新規にイベントを保存した場合）: 201 Created
  - 失敗時（予期せぬサーバー内部エラーの場合）: 500 Internal Server Error -（推奨）認証失敗時は 401 Unauthorized または 403 Forbidden、リクエストの形式不正や必須パラメータ不足の場合は 400 Bad Request を返すとより堅牢ですが、本課題では主に上記ステータスコードでの応答を想定しています。

### リクエストヘッダー例

```
X-Store-Topic:orders/create
X-Store-Hmac-Sha256:NzRuMCLHTZn3dZA/2100jVYRCVCdaPoommD420mfB4Y=
X-Store-Webhook-Id:b54557e4-bdd9-4b37-8a5f-bf7d70bcd043
X-Store-Event-Id:98880550-7158-44d4-b7cd-2c97c8a091b5
X-Store-Triggered-At:2023-03-29T18:00:27.877041743Z
```

### リクエストボディ例

```json
{
  "id": 820982911946,
  "created_at": "2023-10-26T10:00:00-04:00",
  "currency": "JPY",
  "email": "john.smith@example.com",
  "name": "#1001",
  "order_number": 1001,
  "total_price": "15000",
  "subtotal_price": "14000",
  "total_discounts": "1000",
  "total_tax": "1000",
  "customer": {
    "id": 115310627314,
    "email": "john.smith@example.com",
    "first_name": "John",
    "last_name": "Smith"
  },
  "custom_attributes": {
    "app_user_id": "0196b309-6f67-7a74-93ac-a73840bfa2a7"
  },
  "line_items": [
    {
      "product_id": 788032119674,
      "title": "Special ramen set",
      "quantity": 2,
      "price": "7000"
    }
  ]
}
```

## 提出方法

### 【手順1：提出用プライベートリポジトリの作成】

1. GitHubの「New Repository」ページから、提出用プライベートリポジトリを作成します。
   - **リポジトリ名**は任意です

### 【手順2：こちらのリポジトリのbare cloneを作成】

2. ターミナルで、以下のコマンドを実行して、こちらのリポジトリの**bare clone**を作成します。

```bash
git clone --bare https://github.com/awarefy/coding-assignment.git
```

※ `--bare` オプションを使うことで、作業用のワーキングツリーがない完全なリポジトリコピーが得られます。

### 【手順3：提出用プライベートリポジトリへのmirror push】

3. bare cloneしたディレクトリに移動し、mirror pushを行います。

```bash
cd coding-assignment.git
git push --mirror https://github.com/<自分のユーザー名>/<提出用プライベートリポジトリ>.git
```

### 【手順4：一時ディレクトリの削除とローカルクローンの作成】

4. 一時的に作成したbare cloneを削除し、自分の作業用に提出用プライベートリポジトリをクローンします。

```bash
cd ..
rm -rf coding-assignment.git

git clone https://github.com/<自分のユーザー名>/<提出用プライベートリポジトリ>.git
```

### 【提出時の注意事項】

1. 実装が完了したら、成果物を提出用プライベートリポジトリにpushしてください
2. プライベートリポジトリのURLを提出し、アクセス権限を共有してください
3. `store-event-webhook-receiver/README.md` を更新し、以下を記載してください:
   - セットアップ手順と実行方法
   - 実装の概要と使用した技術の説明
   - 設計上の決定事項や工夫した点
   - 改善点や追加したい機能（時間があればどう拡張するか）
