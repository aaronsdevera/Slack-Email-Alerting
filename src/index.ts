function getUnixEpoch(): number {
	return Math.floor(Date.now() / 1000);
}

function getDateTime(unixEpoch: number): Date {
	return new Date(unixEpoch * 1000);
}

function getDateTimeString(unixEpoch: number): string {
	return getDateTime(unixEpoch).toISOString();
}

function sendToSlack(data: Object): Promise<Object> {
	return fetch(env.SLACK_WEBHOOK_URL, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	});
}


export default {
	async email(message, env, ctx): Promise<void> {

		const created_at = getUnixEpoch();
		const created_at_date = getDateTime(created_at);
		const created_at_string = getDateTimeString(created_at);

		// Parse email
		const { from, to } = message;
		const subject = message.headers.get('subject') || '(no subject)';

		// BugFix: Replace "UTF-8" with "utf-8" to prevent letterparser from throwing an error for some messages.
		const rawEmail = message.raw;
		const email = await letterparser.parse(rawEmail.replace('UTF-8', 'utf-8'));

		const title = 'New email received at ' + created_at_string
		const body = `*From:* ${from}\n*Subject:* ${subject}\n\n${email.text}`;

		const payload = {
			blocks: [
				{
					type: 'header',
					text: title,
					emoji: true
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: body
					}
				},
			]
		};

		

		try {
			const response = await sendToSlack(payload);
		} catch(e) {
			console.log(e);
		}
	}
} satisfies ExportedHandler<Env>;
