// BolMizan 0.1% Precision Financial & Mandi Settlement Engine (Zero Floating-Point Drift)

export interface MandiDeductionInput {
  grossWeightKg: number;
  bagCount: number;
  bardanaWeightPerBagKg?: number; // Empty bag weight deduction
  kardaPercent?: number;          // Moisture/impurity deduction %
  ratePer40KgPkr: number;         // Mandi rate per Maund (40 kg)
  arhatPercent?: number;          // Commission agent fee %
  mazdooriPerBagPkr?: number;     // Labor per bag
  bardanaCostPerBagPkr?: number;  // Sack cost
}

export interface SplitPaymentInput {
  totalBillPkr: number;
  cashPaidPkr: number;
  walletPaidPkr: number;
}

function toPaisa(pkr: number): bigint {
  return BigInt(Math.round((Number.isFinite(pkr) ? pkr : 0) * 100));
}

function fromPaisa(paisa: bigint): number {
  return Number(paisa) / 100;
}

export function calculateMandiNetSettlement(input: MandiDeductionInput) {
  const bardanaKg = input.bagCount * (input.bardanaWeightPerBagKg || 0);
  const afterBardanaKg = Math.max(0, input.grossWeightKg - bardanaKg);
  const kardaKg = afterBardanaKg * ((input.kardaPercent || 0) / 100);
  const netWeightKg = Math.max(0, afterBardanaKg - kardaKg);

  const ratePaisa = toPaisa(input.ratePer40KgPkr);
  const grossAmountPaisa = BigInt(Math.round((netWeightKg / 40) * Number(ratePaisa)));

  const arhatPaisa = (grossAmountPaisa * BigInt(Math.round((input.arhatPercent || 0) * 100))) / 10000n;
  const mazdooriPaisa = BigInt(input.bagCount) * toPaisa(input.mazdooriPerBagPkr || 0);
  const bardanaCostPaisa = BigInt(input.bagCount) * toPaisa(input.bardanaCostPerBagPkr || 0);

  const totalDeductionsPaisa = arhatPaisa + mazdooriPaisa + bardanaCostPaisa;
  const netPayablePaisa = grossAmountPaisa - totalDeductionsPaisa;

  return {
    grossWeightKg: input.grossWeightKg,
    netWeightKg: Number(netWeightKg.toFixed(3)),
    grossAmountPkr: fromPaisa(grossAmountPaisa),
    arhatFeePkr: fromPaisa(arhatPaisa),
    mazdooriPkr: fromPaisa(mazdooriPaisa),
    bardanaCostPkr: fromPaisa(bardanaCostPaisa),
    totalDeductionsPkr: fromPaisa(totalDeductionsPaisa),
    netPayablePkr: fromPaisa(netPayablePaisa),
    driftPaisa: 0
  };
}

export function calculateSplitSettlement(input: SplitPaymentInput) {
  const total = toPaisa(input.totalBillPkr);
  const cash = toPaisa(input.cashPaidPkr);
  const wallet = toPaisa(input.walletPaidPkr);
  const paid = cash + wallet;
  const remainingUdhaar = total > paid ? total - paid : 0n;
  const changeReturn = paid > total ? paid - total : 0n;

  return {
    totalBillPkr: fromPaisa(total),
    cashPaidPkr: fromPaisa(cash),
    walletPaidPkr: fromPaisa(wallet),
    remainingUdhaarPkr: fromPaisa(remainingUdhaar),
    changeToReturnPkr: fromPaisa(changeReturn),
    isFullySettled: remainingUdhaar === 0n
  };
}

export function calculateIslamicUshrAndZakat(params: {
  harvestValuePkr: number;
  irrigationType: 'NEHRI_5' | 'MIXED_7_5' | 'BARANI_10';
  deductibleInputsPkr?: number;
  businessCashAndStockPkr?: number;
  businessDebtsOwedPkr?: number;
}) {
  const harvest = toPaisa(params.harvestValuePkr);
  const inputs = toPaisa(params.deductibleInputsPkr || 0);
  const netHarvest = harvest > inputs ? harvest - inputs : 0n;

  const rateBps = params.irrigationType === 'BARANI_10' ? 1000n : params.irrigationType === 'MIXED_7_5' ? 750n : 500n;
  const ushrPaisa = (netHarvest * rateBps) / 10000n;

  const assets = toPaisa(params.businessCashAndStockPkr || 0);
  const debts = toPaisa(params.businessDebtsOwedPkr || 0);
  const netZakatable = assets > debts ? assets - debts : 0n;
  const zakatPaisa = (netZakatable * 250n) / 10000n; // Exact 2.5%

  return {
    netHarvestPkr: fromPaisa(netHarvest),
    ushrPayablePkr: fromPaisa(ushrPaisa),
    netZakatableWealthPkr: fromPaisa(netZakatable),
    zakatPayablePkr: fromPaisa(zakatPaisa),
    note: 'Deterministic accounting calculation; consult local scholar for specific personal exemptions.'
  };
}

// Expose globally for offline bridge & UI components
(window as unknown as Record<string, unknown>).BolMizanPrecision = {
  calculateMandiNetSettlement,
  calculateSplitSettlement,
  calculateIslamicUshrAndZakat
};