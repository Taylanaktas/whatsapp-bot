import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Bot çalışıyor");
});

app.listen(PORT, () => {
  console.log("HTTP server çalışıyor:", PORT);
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("QR KOD:");
      console.log(qr);
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("Bağlantı kapandı. Tekrar bağlanıyor:", shouldReconnect);

      if (shouldReconnect) {
        startBot();
      }
    }

    if (connection === "open") {
      console.log("WhatsApp bağlandı");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    if (text === ".menu") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Komutlar:\n.menu\n.saat"
      });
    }

    if (text === ".saat") {
      const now = new Date().toLocaleTimeString("tr-TR");
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Saat: " + now
      });
    }
  });
}

startBot();
