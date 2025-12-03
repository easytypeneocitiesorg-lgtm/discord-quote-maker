import { createCanvas, loadImage } from "canvas";

export default async function handler(req, res) {
  const { username, avatar, text } = req.query;

  if (!username || !avatar || !text) {
    return res.status(400).send("Missing username, avatar, or text");
  }

  try {
    // Canvas dimensions
    const width = 600;
    const height = 200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background (Discord-style dark)
    ctx.fillStyle = "#2C2F33";
    ctx.fillRect(0, 0, width, height);

    // Optional shadow box behind text (like a Discord embed)
    ctx.fillStyle = "#23272A";
    ctx.fillRect(120, 30, width - 140, height - 60);
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;

    // Load avatar
    const avatarImg = await loadImage(avatar);
    const avatarSize = 100;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarSize/2 + 20, height/2, avatarSize/2, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 20, height/2 - avatarSize/2, avatarSize, avatarSize);
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

    // Send PNG
    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer());

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

// Helper: wrap long text
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
