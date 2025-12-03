import { createCanvas, loadImage } from "canvas";

export default async function handler(req, res) {
  const { username, avatar, text } = req.query;

  if (!username || !text) {
    return res.status(400).send("Missing username or text");
  }

  try {
    const width = 600;
    const height = 200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#2C2F33";
    ctx.fillRect(0, 0, width, height);

    // Default avatar if none provided
    const avatarURL = avatar || "https://i.imgur.com/DPVMz9T.png"; // placeholder avatar

    // Load avatar
    let avatarImg;
    try {
      avatarImg = await loadImage(avatarURL);
    } catch {
      avatarImg = await loadImage("https://i.imgur.com/DPVMz9T.png"); // fallback
    }

    const avatarSize = 100;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarSize / 2 + 20, height / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 20, height / 2 - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();

    // Username
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px Sans";
    ctx.fillText(username, 140, 65);

    // Quote text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Sans";
    const maxWidth = width - 160;
    wrapText(ctx, text, 140, 100, maxWidth, 26);

    // Return PNG
    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer());
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
