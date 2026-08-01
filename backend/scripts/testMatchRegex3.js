const text = `Match Column I with Column II.
Column I:
1. Normal on horizontal motion
2. Centripetal force
3. Gravity in horizontal motion
4. Friction during sliding
Column II.
a. Zero
b. Zero
c. Zero
d. Negative
Choose the correct:`;

// require start of line or space, but not words before it. Actually ^|\n is best
const alphaReg = /(?:^|\n)\s*([A-Ea-ep-t])[\.\)]\s+([\s\S]*?)(?=(?:\n\s*(?:[A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+)|$)/gi;
const numReg = /(?:^|\n)\s*([1-5]|I{1,3}|IV|V)[\.\)]\s+([\s\S]*?)(?=(?:\n\s*(?:[A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+)|$)/gi;

const alphas = [];
const romans = [];

let m;
while ((m = alphaReg.exec(text))) {
  alphas.push({ id: m[1], text: m[2].replace(/(List|Column)[\s-]*[I]+/gi, '').trim() });
}
while ((m = numReg.exec(text))) {
  romans.push({ id: m[1], text: m[2].replace(/(List|Column)[\s-]*[I]+/gi, '').trim() });
}

console.log('Alphas:', alphas);
console.log('Romans:', romans);
