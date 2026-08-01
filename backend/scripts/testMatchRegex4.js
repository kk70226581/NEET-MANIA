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

function parseMatchText(text) {
  const firstItemRegex = /(?:^|\n)\s*([A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+/i;
  const firstMatch = text.match(firstItemRegex);
  
  let prefix = '';
  if (firstMatch && firstMatch.index > 0) {
    prefix = text.substring(0, firstMatch.index).replace(/(?:Column|List)[\s-]*I+[:\.]?/gi, '').trim();
  }

  let suffix = '';
  const suffixMatch = text.match(/(Choose the correct|Select the correct|Which of the following)/i);
  if (suffixMatch) {
    suffix = text.substring(suffixMatch.index).trim();
  }

  let parseText = text;
  if (suffixMatch) parseText = parseText.substring(0, suffixMatch.index);
  
  // Clean headers that might bleed into item text
  parseText = parseText.replace(/(?:^|\n)\s*(?:Column|List)[\s-]*I+[:\.]?\s*(?=\n|$)/gi, '\n');

  const alphaReg = /(?:^|\n)\s*([A-Ea-ep-t])[\.\)]\s+([\s\S]*?)(?=(?:\n\s*(?:[A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+)|$)/gi;
  const numReg = /(?:^|\n)\s*([1-5]|I{1,3}|IV|V)[\.\)]\s+([\s\S]*?)(?=(?:\n\s*(?:[A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+)|$)/gi;
  
  const alphas = [];
  const romans = [];
  
  let m;
  while ((m = alphaReg.exec(parseText))) {
    alphas.push({ id: m[1], text: m[2].replace(/(?:Column|List)[\s-]*I+[:\.]?/gi, '').trim() });
  }
  while ((m = numReg.exec(parseText))) {
    romans.push({ id: m[1], text: m[2].replace(/(?:Column|List)[\s-]*I+[:\.]?/gi, '').trim() });
  }

  return { prefix, suffix, alphas, romans };
}

console.log(JSON.stringify(parseMatchText(text), null, 2));
