#!/bin/bash
sed -i 's/<span className="font-mono text-\[10px\] tabular-nums text-muted-foreground">/<span className="inline-flex items-center justify-center rounded-full bg-accent\/10 px-1.5 py-0.5 font-mono text-\[10px\] tabular-nums text-accent group-data-\[active=true\]:bg-background group-data-\[active=true\]:text-foreground">/g' src/templates/modern/components/shared/FilterChips.tsx
sed -i 's/className=\[/className=\[\n            "group",/g' src/templates/modern/components/shared/FilterChips.tsx
