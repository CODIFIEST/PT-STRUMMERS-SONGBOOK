<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	let isDownloading = false;

	async function downloadAll() {
		isDownloading = true;

		// Dynamic import prevents crash
		const JSZip = (await import('jszip')).default;
		const fileSaver = (await import('file-saver')).default;
		
		const zip = new JSZip();

		// 1. Fetch all files
		const promises = data.songs.map(async (song) => {
			try {
				const response = await fetch(song.url);
				const blob = await response.blob();
				zip.file(song.name, blob);
			} catch (err) {
				console.error('Failed to download', song.name);
			}
		});

		await Promise.all(promises);

		// 2. Generate and Save
		const content = await zip.generateAsync({ type: 'blob' });
		const saveAs = fileSaver.saveAs || fileSaver;
		saveAs(content, 'ChoirBook-All-Songs.zip');
		
		isDownloading = false;
	}
</script>

<div class="min-h-screen bg-base-200 p-6">
	<div class="max-w-[1600px] mx-auto">
		
		<div class="flex flex-col md:flex-row justify-between items-center mb-8 bg-base-100 p-6 rounded-2xl shadow-sm">
			<div>
				<h1 class="text-4xl font-bold text-primary">Choir Book</h1>
				<p class="opacity-60 mt-1">{data.songs.length} Songs Available</p>
			</div>
			<button 
				class="btn btn-primary mt-4 md:mt-0 gap-2" 
				on:click={downloadAll} 
				disabled={isDownloading || data.songs.length === 0}
			>
				{#if isDownloading}
					<span class="loading loading-spinner"></span>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
				{/if}
				Download All Songs
			</button>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			
			<div class="md:col-span-1">
				<div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-base-300 flex flex-col h-[80vh] sticky top-6">
					<div class="p-4 bg-gray-50 border-b font-bold text-gray-500 uppercase tracking-widest text-sm">
						Quick Index
					</div>
					<div class="overflow-y-auto flex-1 p-2 space-y-1">
						{#each data.songs as song}
							<a href={song.url} target="_blank" class="block px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-sm truncate transition-colors">
								{song.name}
							</a>
						{/each}
					</div>
				</div>
			</div>

			<div class="md:col-span-3 space-y-4">
				{#if data.songs.length === 0}
					<div class="alert alert-info">No songs uploaded yet.</div>
				{/if}

				{#each data.songs as song}
					<a href={song.url} target="_blank" class="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-200 border-l-8 border-primary group">
						<div class="card-body flex-row items-center justify-between p-6">
							<div class="min-w-0"> <h2 class="text-2xl md:text-3xl font-bold truncate text-gray-800 group-hover:text-primary transition-colors">
									{song.name}
								</h2>
								<p class="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
									Tap to Open PDF
								</p>
							</div>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 ml-4">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</a>
				{/each}
			</div>

		</div>

		<div class="divider my-10"></div>
		<div class="text-center pb-10">
			<a href="/admin" class="link link-neutral text-sm">Admin Access</a>
		</div>
	</div>
</div>