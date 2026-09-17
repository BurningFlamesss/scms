const fs = require('fs');
const file = 'src/templates/modern/components/shared/RoutineTable.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  `                <th
                  scope="col"
                  className="sticky left-0 z-[1] w-[112px] bg-secondary px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >`,
  `                <th
                  scope="col"
                  className="sticky left-0 z-[1] w-[112px] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  <div className="absolute inset-0 -z-20 bg-card border-r border-border" />
                  <div className="absolute inset-0 -z-10 bg-secondary" />`
);

fs.writeFileSync(file, data);
