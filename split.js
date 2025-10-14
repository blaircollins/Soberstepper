
export function computeSplit(gross, chain){
  const twithe = gross * 0.12;
  const foundation = gross * 0.02;
  let pool = gross * 0.10;
  const ladder = [];
  let pct = 0.5; // .5, .25, .125, ...
  for(const addr of chain){
    const amt = pool * pct;
    ladder.push({ addr, pct, amount: +amt.toFixed(2) });
    pool -= amt;
    pct = pct / 2;
    if(pct < 0.0009765625) break;
  }
  const ladderTotal = ladder.reduce((s,x)=>s+x.amount,0);
  const remainder = +(gross - (twithe + foundation + ladderTotal)).toFixed(2);
  return { twithe:+twithe.toFixed(2), foundation:+foundation.toFixed(2), ladder, remainder };
}
