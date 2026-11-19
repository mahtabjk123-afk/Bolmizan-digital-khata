import { SignedReceiptArtifact, embedResilientWatermark, extractResilientWatermark } from './bolmizanOmegaCrypto';

export async function renderWatermarkedReceiptPng(
  artifact: SignedReceiptArtifact,
  ushrPkr: number
): Promise<{ dataUrl: string; embeddedHex: string }> {
  const width = 512;
  const height = 640;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Clean Off-White Paper Texture Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // 2. Royal Ajrak Crimson & Indigo Top Header Banner
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, 0, width, 110);
  ctx.fillStyle = '#be123c';
  ctx.fillRect(0, 102, width, 8);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('BOLMIZAN SOVEREIGN PARCHI', 28, 48);
  ctx.font = '13px monospace';
  ctx.fillStyle = '#fda4af';
  ctx.fillText(`NODE: SAKRAND MANDI  |  CODE: ${artifact.shortVerifyCode}`, 28, 78);

  // 3. Receipt Body Details
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(`Receipt ID: ${artifact.payload.receiptId}`, 28, 155);

  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(`Merchant: ${artifact.payload.merchantName}`, 28, 188);
  ctx.fillText(`Details:  ${artifact.payload.counterparty}`, 28, 218);
  ctx.fillText(`Ref ID:   ${artifact.payload.externalRefId || 'OFFLINE-CASH'}`, 28, 248);
  ctx.fillText(`Date:     ${new Date(artifact.payload.timestampMs).toLocaleString()}`, 28, 278);

  // Divider
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(28, 305);
  ctx.lineTo(width - 28, 305);
  ctx.stroke();

  // 4. Net Payout Box
  ctx.fillStyle = '#ecfdf5';
  ctx.fillRect(28, 325, width - 56, 85);
  ctx.strokeStyle = '#10b981';
  ctx.strokeRect(28, 325, width - 56, 85);

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('VERIFIED NET SETTLEMENT PAYOUT', 44, 352);
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(`PKR ${(artifact.payload.amountPaisa / 100).toLocaleString()}`, 44, 390);

  // 5. Shariah Ushr & Cryptographic Proof Footer
  ctx.fillStyle = '#334155';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`Shariah Ushr Reserve: PKR ${ushrPkr.toLocaleString()}`, 28, 445);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(28, 475, width - 56, 130);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('QIM LUMINANCE STEGANOGRAPHY SEALED', 44, 502);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText(`LEAF: ${artifact.merkleLeafHash.slice(0, 38)}`, 44, 528);
  ctx.fillText(`HMAC: ${artifact.hmacSignature.slice(0, 38)}`, 44, 552);
  ctx.fillStyle = '#34d399';
  ctx.fillText('STATUS: IMMUTABLE & WHATSAPP-COMPRESSION SAFE', 44, 582);

  // 6. Embed 64-bit QIM Luminance Watermark into Image Pixels
  const imgData = ctx.getImageData(0, 0, width, height);
  const watermarkedPixels = embedResilientWatermark(
    imgData.data,
    width,
    height,
    artifact.hmacSignature
  );
  imgData.data.set(watermarkedPixels);
  ctx.putImageData(imgData, 0, 0);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    embeddedHex: artifact.hmacSignature.slice(0, 16),
  };
}

export async function verifyUploadedReceiptImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
      resolve(extractResilientWatermark(pixels, img.width, img.height));
    };
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = URL.createObjectURL(file);
  });
}
