const text = `Match Column I with Column II.
Column I:
1. Acacia
2. Calotropis
Column II:
(i) Thorns
(ii) Cardiac glycosides`;

const alphaReg = /(?:^|\n)\s*\(?([A-Ea-ep-t])[\.\)]\s+([\s\S]*?)(?=(?:\n\s*\(?(?:[A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+)|$)/gi;
const numReg = /(?:^|\n)\s*\(?([1-5]|I{1,3}|IV|V)[\.\)]\s+([\s\S]*?)(?=(?:\n\s*\(?(?:[A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+)|$)/gi;
  
const alphas = [];
const romans = [];
let m;
while ((m = alphaReg.exec(text))) alphas.push({ id: m[1], text: m[2] });
while ((m = numReg.exec(text))) romans.push({ id: m[1], text: m[2] });

console.log('alphas:', alphas);
console.log('romans:', romans);
