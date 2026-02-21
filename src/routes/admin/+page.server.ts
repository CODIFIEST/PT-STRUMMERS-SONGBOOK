import { fail } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { ADMIN_PASSWORD } from '$env/static/private';

const ALLOWED_BUCKETS = ['sheet-music', 'christmas-music'];

export const actions = {
	upload: async ({ request }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		const bucket = formData.get('bucket') as string;
		const files = formData.getAll('files') as File[];

		if (password !== ADMIN_PASSWORD) return fail(401, { error: 'Wrong Password' });

		if (!ALLOWED_BUCKETS.includes(bucket)) {
			return fail(400, { error: 'Invalid bucket selected' });
		}

		if (!files || files.length === 0 || files[0].size === 0) {
			return fail(400, { error: 'No files selected' });
		}

		const uploadPromises = files.map(async (file) => {
			const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

			const { error } = await supabase.storage
				.from(bucket)
				.upload(cleanName, file, { upsert: true });

			if (error) throw error;
		});

		try {
			await Promise.all(uploadPromises);
		} catch (error: any) {
			return fail(500, { error: error.message || 'Upload failed' });
		}

		return { success: true };
	}
};