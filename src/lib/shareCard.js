import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/**
 * Generates a high-resolution dark-mode Social Flex Card on an HTML5 Canvas.
 * Suitable for Instagram Stories, WhatsApp Status, and Twitter.
 */
export async function generateFlexCardCanvas({
  title = 'Workout Completed',
  date = new Date().toLocaleDateString(),
  durationMinutes = 45,
  totalVolume = 8500,
  unit = 'kg',
  totalSets = 16,
  prsBroken = [],
  streakDays = 12
}) {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1350; // 4:5 Instagram Portrait
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. OLED Dark Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#090b10');
  gradient.addColorStop(0.5, '#050608');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Glow Orbs
  const radGlow1 = ctx.createRadialGradient(200, 200, 10, 200, 200, 400);
  radGlow1.addColorStop(0, 'rgba(163, 230, 53, 0.12)'); // Electric Lime
  radGlow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGlow1;
  ctx.fillRect(0, 0, width, height);

  const radGlow2 = ctx.createRadialGradient(880, 1100, 10, 880, 1100, 450);
  radGlow2.addColorStop(0, 'rgba(6, 182, 212, 0.12)'); // Cyber Cyan
  radGlow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGlow2;
  ctx.fillRect(0, 0, width, height);

  // 3. Card Border Frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // 4. Header Branding
  ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a3e635'; // Lime
  ctx.fillText('⚡ GYMBEAM', 100, 160);

  ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(date, width - 100 - ctx.measureText(date).width, 160);

  // 5. Workout Title
  ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, 100, 280);

  // Subtitle / Badge
  ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`🔥 ${streakDays} DAY STREAK · SESSION COMPLETE`, 100, 340);

  // 6. Metrics Grid Box (Glassmorphic look)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(100, 420, width - 200, 360, [24]);
  ctx.fill();
  ctx.stroke();

  // Metric 1: Total Volume
  ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('TOTAL VOLUME MOVED', 140, 480);

  ctx.font = 'bold 84px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a3e635';
  ctx.fillText(`${totalVolume.toLocaleString()} ${unit}`, 140, 570);

  // Metric 2: Duration
  ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('DURATION', 140, 670);

  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${durationMinutes} min`, 140, 740);

  // Metric 3: Sets
  ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('SETS COMPLETED', 600, 670);

  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${totalSets} sets`, 600, 740);

  // 7. Highlights / PR section
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.roundRect(100, 830, width - 200, 320, [24]);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('🏆 SESSION HIGHLIGHTS', 140, 890);

  if (prsBroken && prsBroken.length > 0) {
    let prY = 960;
    for (const pr of prsBroken.slice(0, 3)) {
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`• ${pr.exercise}: ${pr.weight}${unit} × ${pr.reps} reps (NEW PR!)`, 140, prY);
      prY += 60;
    }
  } else {
    ctx.font = '34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('• Flawless execution across all target hypertrophy zones.', 140, 960);
    ctx.fillText('• 100% scheduled sets checked off.', 140, 1020);
  }

  // 8. Footer Watermark
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#64748b';
  const watermark = 'Tracked with GymBeam · Available on Google Play';
  const wmWidth = ctx.measureText(watermark).width;
  ctx.fillText(watermark, (width - wmWidth) / 2, 1240);

  return canvas;
}

/**
 * Generates and shares or downloads the flex card
 */
export async function shareFlexCard(workoutData) {
  const canvas = await generateFlexCardCanvas(workoutData);
  const dataUrl = canvas.toDataURL('image/png');

  if (Capacitor.isNativePlatform()) {
    try {
      const fileName = `gymbeam_flex_${Date.now()}.png`;
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: 'GymBeam Workout Summary',
        text: `Crushed ${workoutData.title}! Tracked with GymBeam 💪`,
        url: savedFile.uri,
        dialogTitle: 'Share to Instagram / WhatsApp'
      });
      return;
    } catch (err) {
      console.warn('Native share error:', err);
    }
  }

  // Fallback for Web: download file
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `GymBeam_Workout_${new Date().toISOString().slice(0, 10)}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
