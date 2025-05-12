## Store Event Webhook Receiver E2E テスト

### 前提条件

1.  **Docker**: Docker がシステムにインストールされ、実行されていることを確認してください
2.  **Webhook Receiver アプリケーション**: Webhook Receiver アプリケーションが実行中で、`localhost:8080/api/store/webhook` でアクセス可能である必要があります

### テストの実行

E2E テストは、Postman Newman の公式 Docker イメージを利用するシェルスクリプトを使用して実行されます。

1.  **ディレクトリへの移動**:
    `backend/01/store-event-webhook-receiver` ディレクトリに移動します。
    ```bash
    cd path/to/coding-assignment/backend/01/store-event-webhook-receiver
    ```

2.  **Webhook Receiver の実行確認**:
    Store Event Webhook Receiver アプリケーションがまだ実行されていない場合は起動します。`localhost:8080` でリッスンしていることを確認してください。

3.  **テストスクリプトの実行**:
    `run_tests.sh` スクリプトを実行します。
    ```bash
    sh ./run_tests.sh
    ```

### テストコレクションの詳細

*   **コレクションファイル**: `postman_tests/store_event_webhook.json`
*   **ターゲットエンドポイント**: `POST localhost:8080/api/store/webhook`