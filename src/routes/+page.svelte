<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div class="min-h-screen bg-base-200 p-4">
	<div class="max-w-2xl mx-auto">
		<header class="text-center py-8">
			<h1 class="text-4xl font-bold text-primary">PT strummers song book</h1>
			<p class="py-2 text-lg opacity-70">Tap a song to view the music</p>
		</header>

		{#if data.songs.length === 0}
			<div class="alert alert-warning shadow-lg">
				<span>No songs yet! Ask the admin to upload some.</span>
			</div>
		{/if}

		<div class="grid gap-4">
			{#each data.songs as song}
				<a href={song.url} target="_blank" class="card bg-base-100 shadow-xl border-l-8 border-primary active:scale-95 transition-transform">
					<div class="card-body flex-row items-center justify-between p-6">
						<div>
							<h2 class="card-title text-xl font-bold">{song.name}</h2>
							<p class="text-sm uppercase tracking-wide text-gray-500">PDF Document</p>
						</div>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<div class="divider my-10"></div>
		<div class="text-center pb-10">
			<a href="/admin" class="link link-neutral text-sm">Admin Access</a>
		</div>
	</div>
</div>