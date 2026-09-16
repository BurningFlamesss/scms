const fs = require('fs');
const file = 'src/templates/modern/components/layout/Sidebar.tsx';
let d = fs.readFileSync(file, 'utf8');
d = d.replace('const isAdmin = pathname.startsWith("/admin") || pathname === "/login";', 'const isAdmin = pathname.startsWith("/admin");');

const replaceRegex = /<>\s*<Link\s*to="\/signup"[\s\S]*?<\/Link>\s*<Link\s*to="\/login"[\s\S]*?>\s*Login\s*<\/Link>\s*<\/>/m;

d = d.replace(replaceRegex, `<Link
				to="/login"
				className="bg-primary flex w-full items-center justify-center py-2 cursor-pointer rounded-b-2xl text-primary-foreground hover:bg-primary/90"
			>
				Login
			</Link>`);

fs.writeFileSync(file, d);
