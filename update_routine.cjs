const fs = require('fs');
const file = 'src/templates/modern/components/shared/RoutineTable.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  `                      <th
                        scope="row"
                        className={[
                          "sticky left-0 z-[1] px-4 py-3 text-left align-top",
                          isToday
                            ? "bg-[hsl(var(--accent)/0.1)]"
                            : rowIndex % 2 === 1
                              ? "bg-[hsl(var(--secondary))]"
                              : "bg-card",
                        ].join(" ")}
                      >`,
  `                      <th
                        scope="row"
                        className={[
                          "sticky left-0 z-[1] px-4 py-3 text-left align-top relative",
                        ].join(" ")}
                      >
                        <div className={[
                          "absolute inset-0 -z-10 pointer-events-none border-r border-border",
                          isToday ? "bg-accent/10" : rowIndex % 2 === 1 ? "bg-secondary" : "bg-card"
                        ].join(" ")} style={{ backgroundColor: "var(--card)" }}>
                           <div className={[
                             "absolute inset-0 -z-10",
                             isToday ? "bg-accent/10" : rowIndex % 2 === 1 ? "bg-secondary" : "bg-card"
                           ].join(" ")} />
                        </div>`
);

fs.writeFileSync(file, data);
