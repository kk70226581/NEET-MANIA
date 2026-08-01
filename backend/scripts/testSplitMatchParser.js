const text = `Match Column I with Column II.
Column I:
1. Acacia
2. Calotropis
3. Nicotine
4. Camouflage
Column II:
(i) Thorns
(ii) Cardiac glycosides
(iii) Chemical defence
(iv) Cryptic appearance`;

function parseMatch(text) {
  // Find the split point for Column II / List II
  const col2Regex = /(?:^|\n)\s*(?:Column|List)[\s-]*II[:\.]?\s*/i;
  const col2Match = text.match(col2Regex);
  
  if (!col2Match) return null;

  const text1 = text.substring(0, col2Match.index);
  let text2 = text.substring(col2Match.index + col2Match[0].length);

  // Find suffix (Choose the correct option...)
  let suffix = '';
  const suffixMatch = text2.match(/(?:^|\n)\s*(Choose the correct|Select the correct|Which of the following)/i);
  if (suffixMatch) {
    suffix = text2.substring(suffixMatch.index).trim();
    text2 = text2.substring(0, suffixMatch.index);
  }

  // Also remove Column I header from text1 and extract prefix
  let prefix = '';
  const col1Regex = /(?:^|\n)\s*(?:Column|List)[\s-]*I[:\.]?\s*/i;
  const col1Match = text1.match(col1Regex);
  let list1Text = text1;
  if (col1Match) {
    prefix = text1.substring(0, col1Match.index).trim();
    list1Text = text1.substring(col1Match.index + col1Match[0].length);
  } else {
    // If no explicit Column I, prefix is everything before the first item
    const firstItemMatch = text1.match(/(?:^|\n)\s*\(?([A-Za-z0-9]+|I{1,3}|IV|V)[\.\)]\s+/i);
    if (firstItemMatch) {
      prefix = text1.substring(0, firstItemMatch.index).trim();
      list1Text = text1.substring(firstItemMatch.index);
    }
  }

  // Unified Item Regex
  const itemRegex = /(?:^|\n)\s*\(?([A-Za-z0-9]+|I{1,3}|IV|V)[\.\)]\s+([\s\S]*?)(?=(?:\n\s*\(?(?:[A-Za-z0-9]+|I{1,3}|IV|V)[\.\)]\s+)|$)/gi;
  
  const extractItems = (t) => {
    const items = [];
    let m;
    // reset lastIndex
    const regex = new RegExp(itemRegex);
    while ((m = regex.exec(t))) {
      items.push({ id: m[1], text: m[2].trim() });
    }
    return items;
  };

  const list1 = extractItems(list1Text);
  const list2 = extractItems(text2);

  return { prefix, list1, list2, suffix };
}

console.log(JSON.stringify(parseMatch(text), null, 2));
