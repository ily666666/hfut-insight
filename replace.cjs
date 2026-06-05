const fs = require('fs');
const files = [
  'src/platforms/vision/navigation.ts',
  'src/platforms/studio/navigation.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/icon: 'i-mdi-/g, "icon: 'mdi:");
  fs.writeFileSync(file, content);
}
console.log('Done');