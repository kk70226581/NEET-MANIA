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

function parseMatchTheFollowing(text) {
  // Try to find the split point for List II
  const col2Regex = /(?:Column|List)[\s-]*II[:\.]?\s*/i;
  const col2Match = text.match(col2Regex);
  
  if (!col2Match) { console.log('No col2 match'); return null; }

  const beforeCol2 = text.substring(0, col2Match.index);
  const afterCol2 = text.substring(col2Match.index + col2Match[0].length);

  // Extract items from a block of text
  const extractItems = (block) => {
    // Need to match start of line or space before the ID
    const itemRegex = /(?:^|\n)\s*([A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+([\s\S]*?)(?=(?:\n\s*(?:[A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+)|$)/gi;
    const items = [];
    let m;
    while ((m = itemRegex.exec(block))) {
      let itemText = m[2].trim();
      const suffixMatch = itemText.match(/(Choose the correct|Select the correct|Which of the following)/i);
      if (suffixMatch) {
        itemText = itemText.substring(0, suffixMatch.index).trim();
      }
      items.push({ id: m[1], text: itemText });
    }
    return items;
  };

  let list1 = extractItems(beforeCol2);
  let list2 = extractItems(afterCol2);

  if (list1.length === 0 || list2.length === 0) {
    console.log('Lists empty', list1, list2);
    return null;
  }

  // Find prefix
  const col1Regex = /(?:Column|List)[\s-]*I[:\.]?\s*/i;
  const col1Match = beforeCol2.match(col1Regex);
  let prefix = '';
  if (col1Match) {
    prefix = beforeCol2.substring(0, col1Match.index).trim();
  } else {
    // If no explicit Column I, prefix is everything before the first item of list 1
    const firstItemRegex = /(?:^|\n)\s*([A-Ea-ep-t1-5]|I{1,3}|IV|V)[\.\)]\s+/i;
    const firstItemMatch = beforeCol2.match(firstItemRegex);
    if (firstItemMatch) {
      prefix = beforeCol2.substring(0, firstItemMatch.index).trim();
    }
  }

  // Find suffix
  let suffix = '';
  const suffixMatch = text.match(/(Choose the correct|Select the correct|Which of the following)/i);
  if (suffixMatch) {
    suffix = text.substring(suffixMatch.index).trim();
  }

  return { prefix, list1, list2, suffix };
}

console.log(JSON.stringify(parseMatchTheFollowing(text), null, 2));
