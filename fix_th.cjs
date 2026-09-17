const fs = require('fs');
const file = 'src/templates/modern/components/shared/RoutineTable.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /                        <div className=\{\[\s*"absolute inset-0 -z-10 pointer-events-none border-r border-border",\s*isToday \? "bg-accent\/10" : rowIndex % 2 === 1 \? "bg-secondary" : "bg-card"\s*\]\.join\(" "\)\} style=\{\{ backgroundColor: "hsl\(var\(--card\)\)" \}\}>\s*<div className=\{\[\s*"absolute inset-0 -z-10",\s*isToday \? "bg-accent\/10" : rowIndex % 2 === 1 \? "bg-secondary" : "bg-card"\s*\]\.join\(" "\)\} \/>\s*<\/div>/g,
  `                        <div className="absolute inset-0 -z-20 bg-card border-r border-border" />
                        <div className={[
                             "absolute inset-0 -z-10 border-r border-transparent",
                             isToday ? "bg-accent/10" : rowIndex % 2 === 1 ? "bg-secondary" : "bg-transparent"
                           ].join(" ")} />`
);

fs.writeFileSync(file, data);
