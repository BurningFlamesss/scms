import { useSchoolConfig } from "#/packages/school/hook.tsx";

function Contact() {
	const { contact } = useSchoolConfig();
	return (
		<div>
			Email at <a href={`mailto:${contact.email}`}>{contact.email}</a>
			
			<br />
			Phone at <a href={`tel:${contact.phone}`}>{contact.phone}</a>
		</div>
	);
}

export default Contact;
