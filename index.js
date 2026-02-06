import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import fetch from "node-fetch";
import fs from "fs";

const { state, saveCreds } = await useMultiFileAuthState("auth");

const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true
});

sock.ev.on("creds.update", saveCreds);

const songs = [
  "Müslüm Gürses - Affet",
  "Sezen Aksu - Gülümse",
  "Ferdi Tayfur - Ben de Özledim",
  "İbrahim Tatlıses - Haydi Söyle"
];

sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

  if (!text) return;

  if (text === ".sarki") {
    const song = songs[Math.floor(Math.random() * songs.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: "🎵 " + song });
  }

  if (text === ".1930") {
    const now = new Date();
    const target = new Date();
    target.setHours(19, 30, 0);

    let diff = target - now;
    if (diff < 0) diff += 24 * 60 * 60 * 1000;

    const minutes = Math.floor(diff / 60000);
    await sock.sendMessage(msg.key.remoteJid, { text: `⏱️ 19:30'a ${minutes} dakika var.` });
  }
});
