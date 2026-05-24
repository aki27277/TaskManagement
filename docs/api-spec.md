# APIエンドポイント・使用技術

## 1. APIエンドポイント（予定）

| メソッド | パス | 概要 |
|---------|------|------|
| GET | /api/tasks | タスク一覧取得 |
| POST | /api/tasks | タスク作成 |
| PATCH | /api/tasks/:id | タスク更新（内容・ステータス・順序） |
| DELETE | /api/tasks/:id | タスク削除 |

## 2. 使用技術

### フロントエンド

| 項目 | 技術 |
|------|------|
| フレームワーク | React + TypeScript |
| ビルドツール | Vite |
| ドラッグ&ドロップ | @hello-pangea/dnd |
| スタイリング | 未定（Tailwind CSS / CSS Modules など） |
| API通信 | 未定（fetch API / axios など） |

### バックエンド

| 項目 | 技術 |
|------|------|
| 言語・フレームワーク | 未定（Ruby on Rails / Node.js + Express など） |
| APIスタイル | REST API |
| データベース | 未定（PostgreSQL / MySQL など） |
