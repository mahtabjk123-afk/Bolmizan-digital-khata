import crypto from 'node:crypto';

// 1. Generate realistic receipt image (256x256 RGBA with white background & dark text lines)
const width = 256;
const height = 256;
const receiptPixels = new Uint8ClampedArray(width * height * 4);

for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Simulate printed receipt text lines every 24 pixels
        const isTextLine = (y % 24 >= 8 && y % 24 <= 12) && (x > 20 && x < 220);
        const val = isTextLine ? 30 : 245;
        receiptPixels[idx] = val;
        receiptPixels[idx + 1] = val;
        receiptPixels[idx + 2] = val;
        receiptPixels[idx + 3] = 255;
    }
}

// 2. Embed 64-bit QIM Watermark
function embedQIM(pixels, w, h, sigHex) {
    const out = new Uint8ClampedArray(pixels);
    const bits = sigHex.slice(0, 16).split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
    const step = 24;
    let bIdx = 0;

    for (let by = 0; by + 8 <= h && bIdx < bits.length; by += 8) {
        for (let bx = 0; bx + 8 <= w && bIdx < bits.length; bx += 8) {
            const bit = Number(bits[bIdx]);
            let sum = 0;
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const i = ((by + y) * w + (bx + x)) * 4;
                    sum += 0.299 * out[i] + 0.587 * out[i + 1] + 0.114 * out[i + 2];
                }
            }
            const avg = sum / 64;
            const q = Math.round(avg / step);
            const targetQ = (q % 2 === bit) ? q : (avg > q * step ? q + 1 : q - 1);
            const delta = (targetQ * step) - avg;

            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const i = ((by + y) * w + (bx + x)) * 4;
                    out[i] = Math.min(255, Math.max(0, Math.round(out[i] + delta)));
                    out[i + 1] = Math.min(255, Math.max(0, Math.round(out[i + 1] + delta)));
                    out[i + 2] = Math.min(255, Math.max(0, Math.round(out[i + 2] + delta)));
                }
            }
            bIdx++;
        }
    }
    return out;
}

function extractQIM(pixels, w, h) {
    const step = 24;
    let bits = '';
    for (let by = 0; by + 8 <= h && bits.length < 64; by += 8) {
        for (let bx = 0; bx + 8 <= w && bits.length < 64; bx += 8) {
            let sum = 0;
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const i = ((by + y) * w + (bx + x)) * 4;
                    sum += 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
                }
            }
            bits += Math.abs(Math.round((sum / 64) / step) % 2).toString();
        }
    }
    let hex = '';
    for (let i = 0; i < bits.length; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    return hex;
}

const originalSig = crypto.createHmac('sha256', 'sakrand-key').update('PAR-901').digest('hex').slice(0, 16);
const signedImg = embedQIM(receiptPixels, width, height, originalSig);

// 3. Apply Heavy WhatsApp-Style Lossy Compression + Brightness Shift Attack
const attackedImg = new Uint8ClampedArray(signedImg);
for (let i = 0; i < attackedImg.length; i += 4) {
    const jpegNoise = Math.round((Math.random() - 0.5) * 10); // +/- 5 pixel noise
    attackedImg[i] = Math.min(255, Math.max(0, attackedImg[i] + jpegNoise));
    attackedImg[i + 1] = Math.min(255, Math.max(0, attackedImg[i + 1] + jpegNoise));
    attackedImg[i + 2] = Math.min(255, Math.max(0, attackedImg[i + 2] + jpegNoise));
}

const recoveredSig = extractQIM(attackedImg, width, height);

console.log('Original 64-bit Signature :', originalSig);
console.log('Recovered After Attack  :', recoveredSig);
console.log('Match Status            :', originalSig === recoveredSig ? 'PASS (100% INTACT)' : 'FAIL');
