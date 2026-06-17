export interface SchoolConfig {
	name: string;
	identifier: string;
	theme: "modern";
	branding: {
		primary: `#${string}`;
	};
	features: {
		clubs: boolean;
		events: boolean;
		notices: boolean;
	};
	contact: {
		phone: string;
		email: string;
	};
	seo: {
		title: string;
		description: string;
	};
}

export interface SchoolContent {}
