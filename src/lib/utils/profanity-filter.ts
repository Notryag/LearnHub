// 敏感词过滤工具
const sensitiveWords = [
  '垃圾', '傻逼', '傻B', '废物', '智障', 
  '骗子', '垃圾课', '骂人', '差评', 
  'fuck', 'shit', 'bitch', 'damn'
];

export function profanityFilter(text: string): string {
  if (!text) return text;

  let filteredText = text;
  sensitiveWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, '**');
  });

  return filteredText;
}
