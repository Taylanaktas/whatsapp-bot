import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Bot çalışıyor.");
});

app.listen(PORT, () => {
  console.log("HTTP server çalışıyor:", PORT);
});

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("WhatsApp bağlandı.");
    }

    if (connection === "close") {
      console.log("Bağlantı koptu, tekrar bağlanılıyor...");
      startSock();
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    if (text === "!ping") {
      await sock.sendMessage(msg.key.remoteJid, { text: "pong" });
    }
  });
}

startSock();
