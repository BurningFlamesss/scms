const fs = require('fs');
const file = 'src/routes/login.tsx';
let d = fs.readFileSync(file, 'utf8');

if (!d.includes('PageShell')) {
    d = d.replace(
        'import type { BlockType } from "#/types";',
        'import type { BlockType } from "#/types";\nimport { PageShell } from "#/templates/modern/components/layout/PageShell";'
    );
}

d = d.replace(
    /return \(\s*<AuthPage[\s\S]*?\/>\s*\);/,
    `return (
		<PageShell>
			<AuthPage
				blocks={loginPage?.blocks ?? null}
				orgName={config.organization.name}
				preview={preview}
				onSelectSection={onSelectSection}
			/>
		</PageShell>
	);`
);
fs.writeFileSync(file, d);
