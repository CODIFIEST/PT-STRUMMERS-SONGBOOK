import { supabase } from '$lib/supabase';

export const load = async () => {
	const { data, error } = await supabase.storage.from('sheet-music').list();

	if (error || !data) return { songs: [] };

	const songs = data.map((file) => {
		const { data: publicUrlData } = supabase.storage
			.from('sheet-music')
			.getPublicUrl(file.name);

		return {
			name: file.name,
			url: publicUrlData.publicUrl
		};
	});

	// SORTING LOGIC ADDED HERE
	songs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

	return { songs };
};