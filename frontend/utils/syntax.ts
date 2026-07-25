export function syntaxHighlight(json) {
  if (!json) return '';
  let str = json;
  if (typeof json !== 'string') {
    try {
      str = JSON.stringify(json, null, 2);
    } catch (e) {
      str = String(json);
    }
  }

  // Escape HTML characters to prevent XSS and ensure proper rendering
  str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Syntax highlighting regex including comments
  const regex = /(\/\*[\s\S]*?\*\/|\/\/.*)|("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)/g;
  
  return str.replace(regex, function (match, comment, key, strVal, num, bool, nul) {
    if (comment) {
      return `<span class="text-slate-500">${comment}</span>`;
    } else if (key) {
      const remainder = match.substring(key.length);
      return `<span class="text-syntax-key">${key}</span>${remainder}`;
    } else if (strVal) {
      const isUrl = /^"https?:\/\//.test(strVal)
      const classes = isUrl ? 'text-syntax-str underline underline-offset-2' : 'text-syntax-str'
      return `<span class="${classes}">${strVal}</span>`;
    } else if (num) {
      return `<span class="text-syntax-num">${num}</span>`;
    } else if (bool) {
      return `<span class="text-syntax-bool">${bool}</span>`;
    } else if (nul) {
      return `<span class="text-syntax-null">${nul}</span>`;
    }
    return match;
  });
}
