<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	let isDownloading = false;

	function humanReadableName(filename: string): string {
		// Extract "key of X" or "key X" or "key_G" before stripping, to preserve it
		const keyMatch = filename.match(/key[_\s]+(?:of[_\s]+)?([A-G][b#]?)/i);
		const keyInfo = keyMatch ? ` (Key of ${keyMatch[1].toUpperCase()})` : '';

		return filename
			.replace(/\.pdf$/i, '')
			.replace(/[-_]v\d+[a-z]*/gi, '')            // -v2b, -v3a
			.replace(/[-_]?web\b/gi, '')                 // -web
			.replace(/[-_]?copy\b/gi, '')                // -copy
			.replace(/[-_]?PDF\b/gi, '')                 // PDF
			.replace(/[-_]?CCS\b/gi, '')                 // CCS
			.replace(/[-_]?short[-_]?instr\b/gi, '')     // short-instr
			.replace(/[-_]?easy[-_]?version\b/gi, '')    // easy-version
			.replace(/[-_]?easy\b/gi, '')                // easy
			.replace(/[-_]?short[-_]?version\b/gi, '')   // short-version
			.replace(/[-_]?updated\b/gi, '')             // updated
			.replace(/[-_]?revis(?:ed|e)?[-_]?\d*/gi, '') // revised/rev + optional number
			.replace(/[-_]?alternate[-_]ending\d*/gi, '') // alternate-ending
			.replace(/[-_]?rock[-_]?version\b/gi, '')    // rock-version
			.replace(/[-_]?no[-_]bolded[-_]sparkles\b/gi, '')
			.replace(/[-_]?beginners?[-_]12[-_]bar[-_]blues\b/gi, '')
			.replace(/[-_]?12[-_]bar[-_]blues\b/gi, '')
			.replace(/[-_]?end[-_]of[-_]show\b/gi, '')
			.replace(/\bkey[_\s]+(?:of[_\s]+)?[A-G][b#]?(?:[-_][A-G][b#]?)?\b/gi, '') // strip key from name
			.replace(/\b\d{4,}\b/g, '')                  // 4+ digit numbers (dates)
			.replace(/\.\d+/g, '')                       // .99, .100
			.replace(/[-_]+/g, ' ')                      // remaining dashes/underscores → space
			.replace(/\s{2,}/g, ' ')
			.trim()
			.replace(/\b\w/g, (c) => c.toUpperCase())    // Title Case
			+ keyInfo;
	}

	async function downloadAll() {
		isDownloading = true;

		const JSZip = (await import('jszip')).default;
		const fileSaver = (await import('file-saver')).default;
		
		const zip = new JSZip();

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

		const content = await zip.generateAsync({ type: 'blob' });
		const saveAs = fileSaver.saveAs || fileSaver;
		saveAs(content, 'PT-Strummers-Songbook.zip');
		
		isDownloading = false;
	}
</script>

<div class="page-wrapper">
	<div class="page-inner">

		<!-- Header -->
		<div class="header-bar">
			<div>
				<h1 class="site-title">PT Strummers Songbook</h1>
				<p class="song-count">{data.songs.length} Songs Available</p>
			</div>
			<button
				class="btn btn-primary download-btn"
				on:click={downloadAll}
				disabled={isDownloading || data.songs.length === 0}
			>
				{#if isDownloading}
					<span class="loading loading-spinner"></span>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
					</svg>
				{/if}
				Download All Songs
			</button>
		</div>

		<!-- Main layout -->
		<div class="main-layout">

			<!-- Index sidebar -->
			<aside class="sidebar">
				<div class="sidebar-inner">
					<div class="sidebar-heading">Quick Index</div>
					<div class="sidebar-scroll">
						{#each data.songs as song}
							<a href={song.url} target="_blank" class="index-link">
								{humanReadableName(song.name)}
							</a>
						{/each}
					</div>
				</div>
			</aside>

			<!-- Song list -->
			<div class="song-list">
				{#if data.songs.length === 0}
					<div class="alert alert-info">No songs uploaded yet.</div>
				{/if}

				{#each data.songs as song}
					<a href={song.url} target="_blank" class="song-card">
						<div class="song-card-body">
							<div class="song-title-wrap">
								<h2 class="song-title">
									{humanReadableName(song.name)}
								</h2>
								<p class="song-subtitle">Tap to Open PDF</p>
							</div>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="chevron">
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

<style>
	.page-wrapper {
		min-height: 100vh;
		background-color: var(--fallback-b2, oklch(var(--b2)));
		padding: 1.5rem;
	}

	.page-inner {
		max-width: 1600px;
		margin: 0 auto;
	}

	/* ── Header ── */
	.header-bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		background: var(--fallback-b1, oklch(var(--b1)));
		padding: 1.5rem;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.08);
	}

	.site-title {
		font-size: 2.25rem;
		font-weight: 700;
		color: var(--fallback-p, oklch(var(--p)));
	}

	.song-count {
		opacity: 0.6;
		margin-top: 0.25rem;
	}

	.download-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* ── Main layout ──
	   Stacked on mobile, side-by-side from 1024px up.
	   Using a real <style> block instead of Tailwind so the breakpoint
	   is guaranteed to apply (no purge / JIT issues). */
	.main-layout {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	@media (min-width: 1024px) {
		.main-layout {
			flex-direction: row;
			align-items: flex-start;
		}
	}

	/* ── Sidebar ── */
	.sidebar {
		width: 100%;
	}

	@media (min-width: 1024px) {
		.sidebar {
			width: 280px;
			flex-shrink: 0;
		}
	}

	.sidebar-inner {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 16px rgba(0,0,0,0.08);
		border: 1px solid #e5e7eb;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	@media (min-width: 1024px) {
		.sidebar-inner {
			position: sticky;
			top: 1.5rem;
			max-height: 80vh;
		}
	}

	.sidebar-heading {
		padding: 1rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		font-weight: 700;
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		flex-shrink: 0;
	}

	.sidebar-scroll {
		overflow-y: auto;
		flex: 1;
		padding: 0.5rem;
	}

	/* On mobile, cap sidebar height so it doesn't dominate the screen */
	@media (max-width: 1023px) {
		.sidebar-scroll {
			max-height: 40vh;
		}
	}

	.index-link {
		display: block;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		color: #374151;
		transition: background 0.15s, color 0.15s;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-decoration: none;
	}

	.index-link:hover {
		background: #eff6ff;
		color: #2563eb;
	}

	/* ── Song list ── */
	.song-list {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.song-card {
		display: block;
		background: var(--fallback-b1, oklch(var(--b1)));
		border-radius: 0.75rem;
		box-shadow: 0 2px 8px rgba(0,0,0,0.07);
		border-left: 8px solid var(--fallback-p, oklch(var(--p)));
		transition: box-shadow 0.2s;
		text-decoration: none;
	}

	.song-card:hover {
		box-shadow: 0 6px 24px rgba(0,0,0,0.13);
	}

	.song-card-body {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
	}

	.song-title-wrap {
		min-width: 0;
	}

	.song-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #1f2937;
		transition: color 0.15s;
		white-space: normal;
		word-break: break-word;
		margin: 0;
	}

	@media (min-width: 768px) {
		.song-title {
			font-size: 2rem;
		}
	}

	.song-card:hover .song-title {
		color: var(--fallback-p, oklch(var(--p)));
	}

	.song-subtitle {
		font-size: 0.75rem;
		font-weight: 700;
		color: #9ca3af;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-top: 0.25rem;
	}

	.chevron {
		width: 2.5rem;
		height: 2.5rem;
		color: #d1d5db;
		flex-shrink: 0;
		margin-left: 1rem;
		transition: color 0.15s;
	}

	.song-card:hover .chevron {
		color: var(--fallback-p, oklch(var(--p)));
	}
</style>