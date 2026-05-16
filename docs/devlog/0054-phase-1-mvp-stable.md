# Phase 1 MVP Stable

日付: 2026-05-14

## 背景

人間による最終チェックリスト確認が、現時点ではOKと判断されました。

Phase 1は、Sanity Studio、seed documents、Mac launcher、Local Visual Register、Patch Reviewを使うlocal-first / no-API / manual-review MVPとして安定版扱いにします。

## 決定・変更

- Phase 1 MVPをstable / accepted for local-first MVP useとして記録しました。
- 残る手動工程は意図的な設計として扱います。
- Phase 2A product polishへ進みます。

## 理由

現時点のMVPは、手動生成画像をローカル保存し、patch JSONを確認し、Sanity Studioで手動反映する流れを説明できます。

ここで無理にdirect writeやAPI生成へ進むより、まず安全なローカル運用を安定させる方が、プロジェクト思想に合っています。

## 意図的に手動のまま残す工程

- 画像生成
- patch JSON review
- manual Sanity Studio update
- publishing

## 影響

- Phase 1の機能拡張はいったん完了扱いにします。
- 以降の改善はPhase 2A product polishとして扱います。
- Visual Registerの改善は、使いやすさと手動ミス削減に限定します。

## 次の一手

Phase 2Aでは、Patch Review copy buttons、Studio反映メモ、platform / assetType filter、README Quick Start、smoke test checklistを追加します。
