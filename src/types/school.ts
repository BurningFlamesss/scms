export interface SchoolConfig {
	organization: {
		name: string;
		slug: string;
	};
	theme: {
		template: "modern";
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

export interface SchoolContent {
	sidebar: SidebarContent;
}

export interface SidebarContent {
	logo: string;
	tagline: string;
	collapsible: {
		about: ItemDetail;
		courses: ItemDetail;
		facilities: ItemDetail;
		gallery: ItemDetail;
		moreInfo: ItemDetail;
		contact: ItemDetail;
	};
}

export interface ItemDetail {
	id: string;
	label: string;
	icon?: string;
	href?: string;
	external?: boolean;
	src?: string;
	content?: string;
	children?: Array<ItemDetail>;
}
