# C-WEB CV計測設計

## マイクロCV

- `click_line`: LINEリンクのクリック。LPを含む全ページでこの1イベントに統一する。
- `click_email`: メールリンクのクリック。
- `click_phone`: 電話リンクのクリック。
- `page_type`、`landing_page`、`placement`でページと設置場所を分解する。

旧イベント `cweb_lp_line_click` は新規送信を停止する。過去データを集計するときは、同一ユーザー・同一セッション・近接時刻の `cweb_lp_line_click` と `click_line` を別々に足さない。

## 本CV

リンククリックではなく、実際に連絡内容を受信した時点を `generate_lead` とする。LINE、電話、通常のメールリンクはブラウザだけでは受信完了を確認できないため、クリック時には発火させない。

実装候補は、問い合わせ管理側で受信を確認した際に `generate_lead` を一度だけ送る仕組み。最低限 `lead_id`（匿名の一意ID）、`contact_method`、`landing_page`、`received_at` を保持し、重複送信を防ぐ。連携できるまでは実問い合わせ件数を別台帳で管理し、GA4のクリック数と混同しない。

## 営業ステージ

- `generate_lead`: 連絡内容を実際に受信した時点。本CV候補。
- `quote_presented`: 金額と条件を記載した見積書を提示した時点。広告の自動入札には使わない。
- `purchase`: 契約成立時点。売上は税込額ではなく、会計・広告評価で使う基準を事前に統一する。

`generate_lead`、`quote_presented`、`purchase` はサイト上のクリックでは送らない。問い合わせ台帳またはCRMで事実を確認し、匿名の一意IDで重複を排除したうえで、Measurement Protocolまたはオフラインコンバージョン連携から送る。

## Google広告との整合

- 最適化対象の「プライマリ」は、実受信を確認した `generate_lead` のみを第一候補とする。
- `click_line`、`click_phone`、`click_email` は観察用の「セカンダリ」とし、問い合わせ完了や成約として数えない。
- 実受注が少ない初期は `purchase` を記録してもよいが、入札最適化に必要な件数が貯まるまでは評価指標として扱う。
- GA4管理画面とGoogle広告の設定変更は、本番変更の承認後に行う。

## ローカル検証

URLに `?ga_debug=1` を付けると、送信したGA4イベントが `window.__trackingAudit` に保存される。LINEリンクのクリックで `click_line` が1件記録され、`generate_lead` が記録されないことを確認する。
