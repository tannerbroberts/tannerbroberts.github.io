const fourLetterItemNames = [
  'able', 'acid', 'aged', 'also', 'area', 'army', 'away', 'baby', 'back', 'ball',
  'band', 'bank', 'base', 'bath', 'bear', 'beat', 'been', 'beer', 'bell', 'belt',
  'best', 'bird', 'blow', 'blue', 'boat', 'body', 'bomb', 'bond', 'bone', 'book',
  'boom', 'born', 'boss', 'both', 'bowl', 'bulk', 'burn', 'bush', 'busy', 'call',
  'calm', 'came', 'camp', 'card', 'care', 'case', 'cash', 'cast', 'cell', 'chat',
  'chip', 'city', 'club', 'coal', 'coat', 'code', 'cold', 'come', 'cook', 'cool',
  'cope', 'copy', 'core', 'cost', 'crew', 'crop', 'dark', 'data', 'date', 'dawn',
  'days', 'dead', 'deal', 'dean', 'dear', 'debt', 'deep', 'deny', 'desk', 'dial',
  'dick', 'diet', 'disc', 'disk', 'does', 'done', 'door', 'dose', 'down', 'draw',
  'drew', 'drop', 'drug', 'dual', 'duke', 'dust', 'duty', 'each', 'earn', 'ease',
  'yard', 'yeah', 'year', 'your', 'zero', 'zone', 'zoom', 'zinc', 'zeal', 'yoga'
]
export default function getRandomName() {
  return fourLetterItemNames[Math.floor(Math.random() * fourLetterItemNames.length)]
}