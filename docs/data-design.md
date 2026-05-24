# データ設計

## 1. ER図

```
+------------------+
|      tasks       |
+------------------+
| PK  id           |
|     title        |
|     description  |
|     status       |
|     priority     |
|     due_date     |
|     position     |
|     created_at   |
|     updated_at   |
+------------------+
```

> 今バージョンは個人利用・認証なしのため、テーブルは `tasks` のみ。  
> 将来的に複数ユーザー対応や複数ボード対応を追加する場合は `users`・`boards` テーブルとのリレーションを追加する。

## 2. テーブル定義（tasks）

| カラム名 | 型 | NOT NULL | デフォルト | 説明 |
|---------|-----|----------|-----------|------|
| id | INTEGER (PK) | ✓ | 自動採番 | レコードの一意識別子 |
| title | VARCHAR(255) | ✓ | — | タスクのタイトル |
| description | TEXT | — | NULL | タスクの説明文 |
| status | VARCHAR(20) | ✓ | 'todo' | カラム区分。`todo` / `in_progress` / `done` |
| priority | VARCHAR(10) | ✓ | 'medium' | 優先度。`high` / `medium` / `low` |
| due_date | DATE | — | NULL | 期限日 |
| position | INTEGER | ✓ | — | カラム内での表示順（小さいほど上） |
| created_at | TIMESTAMP | ✓ | 現在時刻 | レコード作成日時 |
| updated_at | TIMESTAMP | ✓ | 現在時刻 | レコード更新日時 |

**statusの値定義**

| 値 | 画面表示 |
|----|---------|
| `todo` | 未着手 |
| `in_progress` | 作業中 |
| `done` | 完了 |

**priorityの値定義**

| 値 | 画面表示 |
|----|---------|
| `high` | 高 |
| `medium` | 中 |
| `low` | 低 |
