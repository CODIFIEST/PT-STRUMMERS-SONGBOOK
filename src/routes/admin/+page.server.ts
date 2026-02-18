import { fail } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { ADMIN_PASSWORD } from '$env/static/private';

export const actions = {
	upload: async ({ request }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		
		// 1. Get ALL files
		const files = formData.getAll('files') as File[];

		if (password !== ADMIN_PASSWORD) return fail(401, { error: 'Wrong Password' });
		if (!files || files.length === 0 || files[0].size === 0) {
			return fail(400, { error: 'No files selected' });
		}

		// 2. Upload them all in parallel
		const uploadPromises = files.map(async (file) => {
			const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
			
			const { error } = await supabase.storage
				.from('sheet-music')
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