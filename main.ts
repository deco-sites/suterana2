import "deco/runtime/htmx/FreshHeadCompat.ts";
import { Layout } from "./_app.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Deco as Deco } from "@deco/deco";
import { bindings as HTMX } from "@deco/deco/htmx";
const deco = await Deco.init<Manifest>({
  manifest,
  bindings: HTMX({
    Layout,
  }),
});


// --- Deno KV ---
const kv = Deno.openKv ? await Deno.openKv() : null;
const MESSAGE_KEY = ["current_message"]; // メッセージ保存用キー

// --- HTTP Request Handler ---
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const params = url.searchParams;

  // 1. パスが '/board' かどうかをチェック
  if (url.pathname === "/board") {
    // '/board' の場合の処理 (以前のロジック)
    const newMessage = params.get("txt"); // 'txt' クエリパラメータを取得
    
    if(!kv) return new Response("KVなし")
    // --- 更新処理 (/board?txt=...) ---
    if (newMessage !== null && req.method === "GET") {
      const trimmedMessage = newMessage.trim();
      if (trimmedMessage) {
        await kv.set(MESSAGE_KEY, trimmedMessage);
        console.log(`[${new Date().toLocaleString()}] /board - Message updated: ${trimmedMessage}`);
      } else {
        console.log(`[${new Date().toLocaleString()}] /board - Empty 'txt' parameter received, update skipped.`);
      }
      // 重要: リダイレクト先も '/board' に変更
      return Response.redirect(url.origin + "/board", 302);
    }

    // --- 表示処理 (/board) ---
    const result = await kv.get<string>(MESSAGE_KEY);
    const currentMessage = result.value ?? "メッセージはありません"; // デフォルトメッセージ

    // メッセージをプレーンテキストで返す
    return new Response(currentMessage, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

  } else {
    return deco.fetch.bind(deco)(req)
  }
}

const envPort = Deno.env.get("PORT");
Deno.serve({handler, port: envPort ? +envPort : 8000 });
