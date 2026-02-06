import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Render kapanmasın diye basit server
app.get("/", (req, res) => {
  res.send("Bot çalışıyor");
});

app.listen(PORT, () => {
  console.log("HTTP server çalışıyor:", PORT);
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("QR KOD:");
      console.log(qr);
    }

    if (connection === "open") {
      console.log("WhatsApp bağlandı");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("Tekrar bağlanılıyor...");
        startBot();
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    if (text === ".ping") {
      await sock.sendMessage(msg.key.remoteJid, { text: "pong" });
    }
  });
}

startBot();
