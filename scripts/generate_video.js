const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const width = 600;
const height = 600;
const totalFrames = 60;
const fps = 30;

const outDir = path.join(__dirname, '..', 'public', 'assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const webmPath = path.join(outDir, 'thermo-animation.webm');
const mp4Path = path.join(outDir, 'thermo-animation.mp4');

// Render mathematical 3D bottle in PPM format (P6 binary)
function generateFramePPM(frameIndex, total) {
  const prog = frameIndex / total;
  const angle = prog * Math.PI * 2;
  const buffer = Buffer.alloc(width * height * 3);

  const cx = width / 2;
  const cy = height / 2 + 10;
  const bottleW = 75;
  const bottleTop = cy - 140;
  const bottleBottom = cy + 160;
  const neckTop = bottleTop - 45;
  const capTop = neckTop - 25;

  let ptr = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;

      let r = 0, g = 0, b = 0;

      // 1. Soft radial background studio spotlight
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      if (distFromCenter < 260) {
        const spot = Math.pow(1 - distFromCenter / 260, 2) * 0.15;
        r += spot * 15;
        g += spot * 40;
        b += spot * 60;
      }

      // 2. Floor shadow
      if (y > bottleBottom && y < bottleBottom + 40) {
        const sDistX = dx / 110;
        const sDistY = (y - (bottleBottom + 10)) / 15;
        const sDist = sDistX * sDistX + sDistY * sDistY;
        if (sDist < 1) {
          const shadowFactor = (1 - sDist) * 0.7;
          r *= (1 - shadowFactor);
          g *= (1 - shadowFactor);
          b *= (1 - shadowFactor);
        }
      }

      // 3. Main Bottle Body
      if (y >= bottleTop && y <= bottleBottom) {
        // Rounded bottom edge
        let effectiveW = bottleW;
        if (y > bottleBottom - 20) {
          const cornerDist = (y - (bottleBottom - 20)) / 20;
          effectiveW = bottleW - (1 - Math.sqrt(Math.max(0, 1 - cornerDist * cornerDist))) * 16;
        }

        if (Math.abs(dx) <= effectiveW) {
          // 3D cylinder lighting calculation
          const nx = dx / effectiveW; // -1 to 1
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx));

          // Rotate light with angle
          const lightAngle = angle;
          const lightDot = Math.max(0.1, (nx * Math.cos(lightAngle) + nz * Math.sin(lightAngle)) * 0.5 + 0.5);

          // Specular highlights
          const spec1 = Math.pow(Math.max(0, 1 - Math.abs(nx - 0.25)), 6);
          const spec2 = Math.pow(Math.max(0, 1 - Math.abs(nx + 0.65)), 12);
          const edgeDim = Math.pow(nz, 0.4);

          // Stainless steel / Obsidian Matte titanium finish
          const baseColor = (0.35 + 0.55 * lightDot) * edgeDim;
          let lum = baseColor + spec1 * 0.45 + spec2 * 0.3;
          lum = Math.min(1.0, lum);

          r = Math.floor(lum * 225);
          g = Math.floor(lum * 232);
          b = Math.floor(lum * 242);

          // Subtle laser etched logo MKA STUDIO
          if (y > cy - 30 && y < cy + 30 && Math.abs(dx) < 30) {
            const logoPattern = Math.sin(x * 0.8) * Math.cos(y * 0.8);
            if (logoPattern > 0.4) {
              r = Math.floor(r * 0.8 + 10);
              g = Math.floor(g * 0.8 + 45);
              b = Math.floor(b * 0.8 + 65);
            }
          }
        }
      }

      // 4. Neck groove and cap
      if (y >= neckTop && y < bottleTop) {
        const neckW = bottleW * 0.88;
        if (Math.abs(dx) <= neckW) {
          const nx = dx / neckW;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx));
          const lum = (0.2 + 0.6 * nz) * Math.max(0.2, (nx * Math.cos(angle) + nz * Math.sin(angle)) * 0.5 + 0.5);
          r = Math.floor(lum * 140);
          g = Math.floor(lum * 150);
          b = Math.floor(lum * 165);
        }
      }

      // 5. Cap & Sports Carabiner Handle
      if (y >= capTop && y < neckTop) {
        const capW = bottleW * 0.92;
        if (Math.abs(dx) <= capW) {
          const nx = dx / capW;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx));
          const spec = Math.pow(Math.max(0, 1 - Math.abs(nx - 0.2)), 4);
          const lum = Math.min(1.0, 0.4 + 0.5 * nz + spec * 0.4);
          r = Math.floor(lum * 210);
          g = Math.floor(lum * 215);
          b = Math.floor(lum * 225);
        }
      }

      // 6. Sports Ring / Carabiner on Top (rotating in 3D)
      const ringY = capTop - 22;
      const ringRadius = 24;
      const ringTiltX = Math.sin(angle) * 12;
      const ringDx = dx - ringTiltX;
      const ringDy = y - ringY;
      const ringDist = Math.sqrt(ringDx * ringDx + ringDy * ringDy);
      if (Math.abs(ringDist - ringRadius) < 5) {
        const ringLum = 0.5 + 0.5 * Math.sin(angle + dx * 0.05);
        r = Math.floor(ringLum * 220 + 20);
        g = Math.floor(ringLum * 230 + 25);
        b = Math.floor(ringLum * 245 + 10);
      }

      buffer[ptr++] = Math.min(255, Math.max(0, Math.floor(r)));
      buffer[ptr++] = Math.min(255, Math.max(0, Math.floor(g)));
      buffer[ptr++] = Math.min(255, Math.max(0, Math.floor(b)));
    }
  }

  const header = `P6\n${width} ${height}\n255\n`;
  return Buffer.concat([Buffer.from(header), buffer]);
}

async function renderVideo() {
  console.log('Generating WebM and MP4 video...');

  // Spawn ffmpeg for WebM
  const ffmpegWebm = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'ppm',
    '-r', String(fps),
    '-i', '-',
    '-c:v', 'libvpx-vp9',
    '-b:v', '1M',
    '-pix_fmt', 'yuva420p',
    '-auto-alt-ref', '0',
    webmPath
  ]);

  // Spawn ffmpeg for MP4
  const ffmpegMp4 = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'ppm',
    '-r', String(fps),
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '22',
    mp4Path
  ]);

  for (let i = 0; i < totalFrames; i++) {
    const ppm = generateFramePPM(i, totalFrames);
    ffmpegWebm.stdin.write(ppm);
    ffmpegMp4.stdin.write(ppm);
  }

  ffmpegWebm.stdin.end();
  ffmpegMp4.stdin.end();

  await Promise.all([
    new Promise(res => ffmpegWebm.on('close', res)),
    new Promise(res => ffmpegMp4.on('close', res))
  ]);

  console.log('Video generated successfully!');
}

renderVideo().catch(console.error);
