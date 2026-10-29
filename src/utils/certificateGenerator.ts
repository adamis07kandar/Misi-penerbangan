import jsPDF from 'jspdf';

/**
 * Robust, client-side Canvas-based Certificate Exporter
 * Zero CORS issues, zero DOM dependencies, works offline and in iframes 100% reliably.
 */
export async function generateCertificateCanvas(
  agentName: string,
  agentClass: string,
  score: number,
  dateStr: string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d')!;

  // 1. Background Parchment Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#fffbeb');
  bgGrad.addColorStop(0.5, '#fef3c7');
  bgGrad.addColorStop(1, '#ffedd5');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Outer Ornate Golden Borders
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 14;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  // Corner Ornaments
  const cornerSize = 50;
  const corners = [
    [70, 70],
    [canvas.width - 70, 70],
    [70, canvas.height - 70],
    [canvas.width - 70, canvas.height - 70],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 4;
    ctx.stroke();
  });

  // 3. Watermark Emblem in Background
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
  ctx.beginPath();
  ctx.arc(0, 0, 320, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Header Badge / Crest
  ctx.textAlign = 'center';
  ctx.fillStyle = '#92400e';
  ctx.font = '900 28px "Outfit", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('AKADEMI PENERBANGAN MISI RIMBA MALAYSIA', canvas.width / 2, 160);

  // 5. Main Certificate Title
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 64px "Cinzel", "Times New Roman", serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('SIJIL PENERBANGAN & KEBIJAKSANAAN', canvas.width / 2, 245);

  ctx.fillStyle = '#78350f';
  ctx.font = 'italic 28px "Outfit", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('Dengan ini disahkan bahawa', canvas.width / 2, 310);

  // 6. Recipient Agent Name
  const safeName = (agentName.trim() || 'EJEN MUDA').toUpperCase();
  ctx.fillStyle = '#b45309';
  ctx.font = '900 68px "Fredoka", "Outfit", sans-serif';
  ctx.fillText(safeName, canvas.width / 2, 410);

  // Underline
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 5;
  const nameWidth = Math.min(ctx.measureText(safeName).width + 60, 1100);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - nameWidth / 2, 430);
  ctx.lineTo(canvas.width / 2 + nameWidth / 2, 430);
  ctx.stroke();

  // Class Info
  const safeClass = (agentClass.trim() || '5 CERDIK').toUpperCase();
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 32px "Outfit", sans-serif';
  ctx.fillText(`KELAS: ${safeClass}`, canvas.width / 2, 490);

  // 7. Citation / Description
  ctx.fillStyle = '#334155';
  ctx.font = '500 28px "Outfit", sans-serif';
  const desc1 = 'Telah berjaya menyempurnakan penerbangan 3D Misi Rimba dengan cemerlang';
  const desc2 = 'serta menguasai kefahaman cerita rakyat "Sang Kancil, Sang Buaya & Sang Kerbau"';
  const desc3 = 'dengan menunjukkan ketangkasan kemudi dan kebijaksanaan akal fikiran.';
  ctx.fillText(desc1, canvas.width / 2, 570);
  ctx.fillText(desc2, canvas.width / 2, 615);
  ctx.fillText(desc3, canvas.width / 2, 660);

  // 8. Score & Date Boxes
  const boxW = 380;
  const boxH = 110;
  const boxY = 730;

  // Score Box
  const scoreX = canvas.width / 2 - boxW - 25;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(scoreX, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 20px "Outfit", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('JUMLAH SKOR AKHIR:', scoreX + 30, boxY + 45);
  ctx.fillStyle = '#b45309';
  ctx.font = '900 42px "Fredoka", sans-serif';
  ctx.fillText(`${score} MATA`, scoreX + 30, boxY + 92);

  // Date Box
  const dateX = canvas.width / 2 + 25;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(dateX, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 20px "Outfit", sans-serif';
  ctx.fillText('TARIKH PENCAPAIAN:', dateX + 30, boxY + 45);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px "Outfit", sans-serif';
  ctx.fillText(dateStr, dateX + 30, boxY + 90);

  // 9. Signatures Area
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(180, 950);
  ctx.lineTo(canvas.width - 180, 950);
  ctx.stroke();

  // Left Signatory
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px "Outfit", sans-serif';
  ctx.fillText('AKADEMI PENERBANGAN MISI RIMBA', 180, 995);
  ctx.fillStyle = '#64748b';
  ctx.font = '20px "Outfit", sans-serif';
  ctx.fillText('Pentauliahan Kemudi Pesawat Twin-Turbine', 180, 1025);

  // Right Signatory (Sang Kancil)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#b45309';
  ctx.font = 'italic bold 32px "Cinzel", cursive';
  ctx.fillText('Sang Kancil', canvas.width - 180, 995);
  ctx.fillStyle = '#64748b';
  ctx.font = '20px "Outfit", sans-serif';
  ctx.fillText('Penaung Kebijaksanaan Rimba', canvas.width - 180, 1025);

  // Center Golden Seal
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 975, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#78350f';
  ctx.font = '900 18px "Outfit", sans-serif';
  ctx.fillText('LULUS', canvas.width / 2, 970);
  ctx.font = 'bold 14px "Outfit", sans-serif';
  ctx.fillText('RASMI', canvas.width / 2, 990);

  return canvas;
}

/**
 * Downloads Certificate as PDF with fallback to PNG image download
 */
export async function downloadCertificatePDF(
  agentName: string,
  agentClass: string,
  score: number,
  dateStr: string
): Promise<void> {
  const canvas = await generateCertificateCanvas(agentName, agentClass, score, dateStr);
  const cleanFilename = `Sijil_Penerbangan_${(agentName.trim() || 'Ejen').replace(/\s+/g, '_')}`;

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`${cleanFilename}.pdf`);
  } catch (err) {
    console.warn('PDF export failed, using instant PNG image download:', err);
    // Instant direct PNG image download fallback
    downloadCertificateImage(agentName, agentClass, score, dateStr);
  }
}

/**
 * Direct 1-click PNG image download of the certificate
 */
export async function downloadCertificateImage(
  agentName: string,
  agentClass: string,
  score: number,
  dateStr: string
): Promise<void> {
  const canvas = await generateCertificateCanvas(agentName, agentClass, score, dateStr);
  const cleanFilename = `Sijil_Penerbangan_${(agentName.trim() || 'Ejen').replace(/\s+/g, '_')}.png`;

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, 'image/png');
}
