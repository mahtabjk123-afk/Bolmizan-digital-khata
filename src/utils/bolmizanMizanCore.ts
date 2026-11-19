export interface MandiParchiInput {
  cropName: string;
  weightKg: number;
  ratePer40KgPaisa: number;
  kardaBasisPoints: number;
  arhtiCommissionBps: number;
  laborHamaliPaisa: number;
}

export interface MandiParchiBreakdown {
  grossValuePaisa: number;
  kardaDeductionPaisa: number;
  netCropValuePaisa: number;
  arhtiCommissionPaisa: number;
  laborHamaliPaisa: number;
  farmerNetPayoutPaisa: number;
}

export function calculateMandiParchi(input: MandiParchiInput): MandiParchiBreakdown {
  if (input.weightKg <= 0 || input.ratePer40KgPaisa <= 0) throw new Error('MIZAN_ERROR: Weight and rate must be positive.');
  const weightGrams = BigInt(Math.round(input.weightKg * 1000));
  const rate = BigInt(Math.round(input.ratePer40KgPaisa));
  const grossBig = (weightGrams * rate) / 40000n;
  const kardaBig = (grossBig * BigInt(input.kardaBasisPoints)) / 10000n;
  const netCropBig = grossBig - kardaBig;
  const commissionBig = (netCropBig * BigInt(input.arhtiCommissionBps)) / 10000n;
  const laborBig = BigInt(Math.round(input.laborHamaliPaisa));

const payoutBig = netCropBig - commissionBig - laborBig;
if (payoutBig < 0n) throw new Error('MIZAN_ERROR: Deductions exceed gross crop value.');
return {
grossValuePaisa: Number(grossBig),
kardaDeductionPaisa: Number(kardaBig),
netCropValuePaisa: Number(netCropBig),
arhtiCommissionPaisa: Number(commissionBig),
laborHamaliPaisa: Number(laborBig),
farmerNetPayoutPaisa: Number(payoutBig),
};
}
export function calculateHarvestUshr(params: {
harvestWeightKg: number;
netHarvestValuePaisa: number;
irrigationType: 'NEHRI_IRRIGATED' | 'BARANI_RAINFED';
}): { ushrDue: boolean; ushrAmountPaisa: number; ratePercent: number; reason: string } {
if (params.harvestWeightKg < 653) {
return { ushrDue: false, ushrAmountPaisa: 0, ratePercent: 0, reason: 'Below Shariah Nisab threshold (653 kg).' };
}
const bps = params.irrigationType === 'BARANI_RAINFED' ? 1000 : 500;
const ushrBig = (BigInt(Math.round(params.netHarvestValuePaisa)) * BigInt(bps)) / 10000n;
return { ushrDue: true, ushrAmountPaisa: Number(ushrBig), ratePercent: bps / 100, reason: (bps / 100) + "% Ushr applicable." };
}
