const text = `Match Column I with Column II.
Column I:
1. Gravity
2. Spring force
3. Kinetic friction
4. Normal force on horizontal motion
Column II:
a. Conservative
b. Conservative
c. Non-conservative
d. Zero work`;

  const alphaReg = /([A-Ea-ep-t])\.\s+([\s\S]*?)(?=(?:[A-Ea-ep-t]\.|[1-5]\.|I{1,3}\.|IV\.|V\.|List[\s-]*[I]+|Column[\s-]*[I]+|Choose\s*the|Select\s*the|Which\s*of|$))/g;
  const numReg = /([1-5]|I{1,3}|IV|V)\.\s+([\s\S]*?)(?=(?:[A-Ea-ep-t]\.|[1-5]\.|I{1,3}\.|IV\.|V\.|List[\s-]*[I]+|Column[\s-]*[I]+|Choose\s*the|Select\s*the|Which\s*of|$))/gi;
  
  const alphas = [];
  const romans = [];
  
  let m;
  alphaReg.lastIndex = 0;
  numReg.lastIndex = 0;
  while ((m = alphaReg.exec(text))) {
    alphas.push({ id: m[1], text: m[2].replace(/(List|Column)[\s-]*[I]+/gi, '').trim() });
  }
  while ((m = numReg.exec(text))) {
    romans.push({ id: m[1], text: m[2].replace(/(List|Column)[\s-]*[I]+/gi, '').trim() });
  }

console.log('Alphas:', alphas);
console.log('Romans:', romans);
