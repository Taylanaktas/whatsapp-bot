import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
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

const { state, saveCreds } = await useMultiFileAuthState("auth");

const sock = makeWASocket({
  auth: state
});

sock.ev.on("creds.update", saveCreds);

// QR kodu loga yazdır
sock.ev.on("connection.update", (update) => {
  const { qr, connection, lastDisconnect } = update;

  if (qr) {
    console.log("QR KOD:");
    console.log(qr);
  }

  if (connection === "close") {
    const shouldReconnect =
      lastDisconnect?.error?.output?.statusCode !==
      DisconnectReason.loggedOut;

    if (shouldReconnect) {
      startSock();
    }
  }

  if (connection === "open") {
    console.log("WhatsApp bağlantısı başarılı");
  }
});

const songs = [
  "Müslüm Gürses - Affet",
  "Sezen Aksu - Gülümse",
  "Ferdi Tayfur - Ben de Özledim",
  "İbrahim Tatlıses - Haydi Söyle"
];

sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text;

  if (!text) return;

  if (text === ".sarki") {
    const song = songs[Math.floor(Math.random() * songs.length)];
    await sock.sendMessage(msg.key.remoteJid, {
      text: "🎵 " + song
    });
  }

  if (text === ".1930") {
    const now = new Date();
    const target = new Date();
    target.setHours(19, 30, 0);

    let diff = target - now;
    if (diff < 0) diff += 24 * 60 * 60 * 1000;

    const minutes = Math.floor(diff / 60000);

    await sock.sendMessage(msg.key.remoteJid, {
      text: `⏱️ 19:30'a ${minutes} dakika var.`
    });
  }
});
