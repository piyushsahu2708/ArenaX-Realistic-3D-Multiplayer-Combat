export interface EloCalculationDetails {
  ratingA: number;
  ratingB: number;
  kFactor: number;
  exponentA: number;
  exponentB: number;
  tenPowExpA: number;
  expectedScoreA: number;
  expectedScoreB: number;
  newRatingAIfWin: number;
  deltaAIfWin: number;
  newRatingBIfLoss: number;
  deltaBIfLoss: number;
  newRatingAIfLoss: number;
  deltaAIfLoss: number;
  newRatingBIfWin: number;
  deltaBIfWin: number;
  newRatingAIfDraw: number;
  deltaAIfDraw: number;
  newRatingBIfDraw: number;
  deltaBIfDraw: number;
}

export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1.0 / (1.0 + Math.pow(10.0, (ratingB - ratingA) / 400.0));
}

export function getFullEloDetails(ratingA: number, ratingB: number, kFactor: number = 32): EloCalculationDetails {
  const exponentA = (ratingB - ratingA) / 400.0;
  const exponentB = (ratingA - ratingB) / 400.0;
  const tenPowExpA = Math.pow(10.0, exponentA);

  const expectedScoreA = 1.0 / (1.0 + tenPowExpA);
  const expectedScoreB = 1.0 - expectedScoreA;

  // Win scenario for A (Actual A = 1, Actual B = 0)
  const deltaAIfWin = Math.round(kFactor * (1.0 - expectedScoreA));
  const newRatingAIfWin = ratingA + deltaAIfWin;
  const deltaBIfLoss = -deltaAIfWin;
  const newRatingBIfLoss = ratingB + deltaBIfLoss;

  // Loss scenario for A (Actual A = 0, Actual B = 1)
  const deltaAIfLoss = Math.round(kFactor * (0.0 - expectedScoreA));
  const newRatingAIfLoss = ratingA + deltaAIfLoss;
  const deltaBIfWin = -deltaAIfLoss;
  const newRatingBIfWin = ratingB + deltaBIfWin;

  // Draw scenario (Actual A = 0.5, Actual B = 0.5)
  const deltaAIfDraw = Math.round(kFactor * (0.5 - expectedScoreA));
  const newRatingAIfDraw = ratingA + deltaAIfDraw;
  const deltaBIfDraw = -deltaAIfDraw;
  const newRatingBIfDraw = ratingB + deltaBIfDraw;

  return {
    ratingA,
    ratingB,
    kFactor,
    exponentA: Number(exponentA.toFixed(4)),
    exponentB: Number(exponentB.toFixed(4)),
    tenPowExpA: Number(tenPowExpA.toFixed(4)),
    expectedScoreA: Number(expectedScoreA.toFixed(4)),
    expectedScoreB: Number(expectedScoreB.toFixed(4)),
    newRatingAIfWin,
    deltaAIfWin,
    newRatingBIfLoss,
    deltaBIfLoss,
    newRatingAIfLoss,
    deltaAIfLoss,
    newRatingBIfWin,
    deltaBIfWin,
    newRatingAIfDraw,
    deltaAIfDraw,
    newRatingBIfDraw,
    deltaBIfDraw,
  };
}
