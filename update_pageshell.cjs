const fs = require('fs');
const file = 'src/templates/modern/components/layout/PageShell.tsx';
let d = fs.readFileSync(file, 'utf8');
d = d.replace(
`\t\t\t{variant === "default" ? (
				<div className="u-container">
					<NoticeTicker />
				</div>
			) : null}`,
`\t\t\t<div className={variant === "default" ? "u-container" : ""}>
				<NoticeTicker />
			</div>`
);
fs.writeFileSync(file, d);
