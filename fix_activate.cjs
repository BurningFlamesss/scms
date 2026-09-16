const fs = require('fs');
const file = 'src/routes/_onboard/activate.tsx';
let d = fs.readFileSync(file, 'utf8');

d = d.replace("split('", "SPLIT_START");
d = d.replace("').map", "SPLIT_END");

d = d.replace(/SPLIT_START[\s\S]*?SPLIT_END/, "split('\n').map");

fs.writeFileSync(file, d);
