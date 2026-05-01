// Bootstrap CommonJS para Phusion Passenger (Hostinger shared hosting)
// Passenger tem problemas com ESM top-level await — este arquivo resolve isso.

process.on("uncaughtException", function (err) {
  console.error("[start.cjs] ERRO NAO CAPTURADO:", err);
  process.exit(1);
});

process.on("unhandledRejection", function (reason) {
  console.error("[start.cjs] PROMISE REJEITADA:", reason);
  process.exit(1);
});

console.log("[start.cjs] Bootstrap iniciado. Node.js " + process.version);
console.log("[start.cjs] cwd=" + process.cwd());
console.log("[start.cjs] PORT=" + process.env.PORT);

// Importa o server.js ESM via dynamic import (suportado em CJS no Node 22)
import("./server.js")
  .then(function () {
    console.log("[start.cjs] server.js carregado com sucesso.");
  })
  .catch(function (err) {
    console.error("[start.cjs] FALHA ao carregar server.js:", err);
    process.exit(1);
  });
