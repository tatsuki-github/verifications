const { encodingForModel } = require("js-tiktoken");

const MAX_TOKENS = 30;
const model = "gpt-4";

// メッセージの配列（例）
const messages = [
  { role: "user", content: "こんにちは" },
  { role: "assistant", content: "こんにちは！ご質問は何ですか？" },
  { role: "user", content: "天気はどうですか？" },
  { role: "assistant", content: "本日の天気は晴れです。" },
  { role: "user", content: "ありがとうございます。" },
];

// エンコーディングを取得
const enc = encodingForModel(model);

// メッセージをトークン数がMAX_TOKENS以下になるように調整
function trimMessagesToFitTokenLimit(messages, maxTokens) {
  let totalTokens = 0;
  const trimmedMessages = [];

  // 各メッセージのトークン数を計算し、合計トークン数を更新
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const tokenCount = enc.encode(message.content).length;
    if (totalTokens + tokenCount > maxTokens) {
      break;
    }
    totalTokens += tokenCount;
    trimmedMessages.unshift(message);
  }

  return trimmedMessages;
}

const adjustedMessages = trimMessagesToFitTokenLimit(messages, MAX_TOKENS);
console.log(adjustedMessages);
