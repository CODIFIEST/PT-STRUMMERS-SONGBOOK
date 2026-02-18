<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	let isDownloading = false;
	let searchQuery = '';
	let showScrollTop = false;

	function humanReadableName(filename: string): string {
		// 1. Extract key info before any stripping (_PDF suffix stripped first so e.g. key_G_PDF works)
		const forKeyDetect = filename.replace(/\.pdf$/i, '').replace(/_PDF$/i, '');
		const keyMatch = forKeyDetect.match(/KEY[-_]?OF[-_]?([A-G][b#]?)|KEY[-_]([A-G][b#]?)(?!\w)/i);
		const keyInfo = keyMatch ? ` (Key of ${(keyMatch[1] || keyMatch[2]).toUpperCase()})` : '';

		// 2. Pre-process: protect apostrophe contractions that use _ as separator
		let name = filename
			.replace(/\.pdf$/i, '')
			.replace(/I_ll/gi, 'XILLX')
			.replace(/I_ve/gi, 'XIVEX')
			.replace(/I_m/gi,  'XIMX')
			.replace(/don_t/gi, 'XDONTX')
			.replace(/ain_t/gi, 'XAINTX')
			.replace(/can_t/gi, 'XCANTX')
			.replace(/won_t/gi, 'XWONTX');

		// 3. Strip file noise — only when clearly a suffix tag (preceded by - or _)
		name = name
			.replace(/[-_]v\d+[a-z]*/gi, '')
			.replace(/[-_]web(?=$|[-_])/gi, '')
			.replace(/[-_]copy(?=$|[-_])/gi, '')
			.replace(/[-_]PDF(?=$|[-_])/gi, '')
			.replace(/[-_]CCS$/gi, '')
			.replace(/CCS$/gi, '')
			.replace(/[-_]short[-_]instr/gi, '')
			.replace(/[-_]easy[-_]version/gi, '')
			.replace(/[-_]short[-_]version/gi, '')
			.replace(/[-_]updated$/gi, '')
			.replace(/[-_]revis(?:ed|e)?[-_]?\d*/gi, '')
			.replace(/[-_]alternate[-_]ending\d*/gi, '')
			.replace(/[-_]rock[-_]version/gi, '')
			.replace(/[-_]no[-_]bolded[-_]sparkles/gi, '')
			.replace(/[-_]beginners?[-_]12[-_]bar[-_]blues/gi, '')
			.replace(/[-_]12[-_]bar[-_]blues/gi, '')
			.replace(/[-_]end[-_]of[-_]show/gi, '')
			// Strip key from display name (various formats in filenames)
			.replace(/[-_]?KEY[-_]?OF[-_]?[A-G][b#]?/gi, '')
			.replace(/[-_]?KEY[-_][A-G][b#]?(?!\w)/gi, '')
			.replace(/MEKEY[-_]OF[-_][A-G][b#]?/gi, 'ME') // e.g. LEAN-ON-MEKEY-OF-A
			.replace(/\b\d{4,}\b/g, '')
			.replace(/\.\d+/g, '');

		// 4. Replace separators with spaces
		name = name.replace(/[-_]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

		// 5. Title case (works on ALL-CAPS too by lowercasing first)
		name = name.toLowerCase()
			.replace(/\b\w/g, (c) => c.toUpperCase());

		// 6. Restore apostrophe contractions
		name = name
			.replace(/XILLX/gi, "I'll")
			.replace(/XIVEX/gi, "I've")
			.replace(/XIMX/gi,  "I'm")
			.replace(/XDONTX/gi, "Don't")
			.replace(/XAINTX/gi, "Ain't")
			.replace(/XCANTX/gi, "Can't")
			.replace(/XWONTX/gi, "Won't")
			// Fix dash-based contractions (no underscore in filename)
			.replace(/\bDont\b/g, "Don't")
			.replace(/\bCant\b/g, "Can't")
			.replace(/\bWont\b/g, "Won't")
			.replace(/\bAint\b/g, "Ain't")
			.replace(/\bIts\b/g, "It's")
			.replace(/\bIm\b/g, "I'm");

		return name + keyInfo;
	}


	$: filteredSongs = searchQuery.trim() === ''
		? data.songs
		: data.songs.filter(song =>
			humanReadableName(song.name).toLowerCase().includes(searchQuery.toLowerCase())
		);

	function handleScroll() {
		showScrollTop = window.scrollY > 300;
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
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

<svelte:head>
	<title>PT Strummers Songbook</title>
</svelte:head>

<svelte:window on:scroll={handleScroll} />

<div class="page-wrapper">
	<div class="page-inner">

		<!-- Header -->
		<div class="header-bar">
			<div>
				<h1 class="site-title">PT Strummers Songbook</h1>
				<div class="header-meta">
					<p class="song-count">
						{#if searchQuery.trim()}
							{filteredSongs.length} of {data.songs.length} songs
						{:else}
							{data.songs.length} Songs Available
						{/if}
					</p>
					<span class="header-divider">·</span>
					<a href="/admin" class="admin-link">Admin</a>
				</div>
			</div>
			<button
				class="btn btn-primary download-btn"
				on:click={downloadAll}
				disabled={isDownloading || data.songs.length === 0}
			>
				{#if isDownloading}
					<span class="loading loading-spinner loading-md"></span>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="download-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
					</svg>
				{/if}
				Download All Songs
			</button>
		</div>

		<!-- Search bar -->
		<div class="search-wrap">
			<div class="search-inner">
				<svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
				</svg>
				<input
					class="search-input"
					type="text"
					placeholder="Search songs…"
					bind:value={searchQuery}
				/>
				{#if searchQuery}
					<button class="search-clear" on:click={() => searchQuery = ''} aria-label="Clear search">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<!-- Main layout -->
		<div class="main-layout">

			<!-- Index sidebar -->
			<aside class="sidebar">
				<div class="sidebar-inner">
					<div class="sidebar-heading">
						Quick Index
						{#if searchQuery.trim()}
							<span class="index-count">({filteredSongs.length})</span>
						{/if}
					</div>
					<div class="sidebar-scroll">
						{#if filteredSongs.length === 0}
							<p class="no-results-index">No matches</p>
						{:else}
							{#each filteredSongs as song}
								<a href={song.url} target="_blank" class="index-link">
									{humanReadableName(song.name)}
								</a>
							{/each}
						{/if}
					</div>
				</div>
			</aside>

			<!-- Song list -->
			<div class="song-list">
				{#if filteredSongs.length === 0}
					<div class="no-results-main">
						<svg xmlns="http://www.w3.org/2000/svg" class="no-results-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
						</svg>
						<p>No songs found for "<strong>{searchQuery}</strong>"</p>
						<button class="btn-clear-search" on:click={() => searchQuery = ''}>Clear search</button>
					</div>
				{:else}
					{#each filteredSongs as song}
						<a href={song.url} target="_blank" class="song-card">
							<div class="song-card-body">
								<div class="song-title-wrap">
									<h2 class="song-title">{humanReadableName(song.name)}</h2>
									<p class="song-subtitle">Tap to Open PDF</p>
								</div>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="chevron">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</a>
					{/each}
				{/if}
			</div>

		</div>

	</div>
</div>

<!-- Floating scroll-to-top button -->
{#if showScrollTop}
	<button class="scroll-top-btn" on:click={scrollToTop} aria-label="Scroll to top">
		<span class="scroll-top-tooltip">Back to top</span>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
		</svg>
	</button>
{/if}

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
		margin-bottom: 1.25rem;
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

	.header-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.song-count {
		opacity: 0.6;
	}

	.header-divider {
		opacity: 0.3;
		font-size: 1rem;
	}

	.admin-link {
		font-size: 0.8rem;
		opacity: 0.45;
		color: inherit;
		text-decoration: none;
		transition: opacity 0.15s;
	}

	.admin-link:hover {
		opacity: 0.9;
		text-decoration: underline;
	}

	.download-btn {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1.2rem;
		font-weight: 700;
		padding: 0.75rem 1.5rem;
		height: auto;
	}

	.download-icon {
		width: 1.75rem;
		height: 1.75rem;
		flex-shrink: 0;
	}

	/* ── Search ── */
	.search-wrap {
		margin-bottom: 1.5rem;
	}

	.search-inner {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		width: 1.25rem;
		height: 1.25rem;
		color: #9ca3af;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.875rem 3rem 0.875rem 2.75rem;
		font-size: 1.125rem;
		border: 2px solid #e5e7eb;
		border-radius: 0.75rem;
		background: var(--fallback-b1, oklch(var(--b1)));
		color: inherit;
		outline: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.search-input:focus {
		border-color: var(--fallback-p, oklch(var(--p)));
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--fallback-p, oklch(var(--p))) 20%, transparent);
	}

	.search-input::placeholder {
		color: #9ca3af;
	}

	.search-clear {
		position: absolute;
		right: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: #e5e7eb;
		color: #6b7280;
		border: none;
		cursor: pointer;
		transition: background 0.15s;
	}

	.search-clear:hover {
		background: #d1d5db;
	}

	/* ── Main layout ── */
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
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.index-count {
		font-weight: 500;
		opacity: 0.7;
	}

	.sidebar-scroll {
		overflow-y: auto;
		flex: 1;
		padding: 0.5rem;
	}

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

	.no-results-index {
		padding: 0.75rem;
		font-size: 0.875rem;
		color: #9ca3af;
		text-align: center;
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

	/* ── No results state ── */
	.no-results-main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		gap: 1rem;
		color: #6b7280;
		text-align: center;
	}

	.no-results-icon {
		width: 3rem;
		height: 3rem;
		opacity: 0.4;
	}

	.btn-clear-search {
		margin-top: 0.5rem;
		padding: 0.5rem 1.25rem;
		border-radius: 0.5rem;
		background: var(--fallback-p, oklch(var(--p)));
		color: white;
		font-weight: 600;
		border: none;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-clear-search:hover {
		opacity: 0.85;
	}

	/* ── Scroll to top button ── */
	.scroll-top-btn {
		position: relative; /* needed for tooltip positioning */
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: var(--fallback-p, oklch(var(--p)));
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 16px rgba(0,0,0,0.2);
		transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
		z-index: 50;
	}

	.scroll-top-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0,0,0,0.25);
	}

	.scroll-top-btn svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.scroll-top-tooltip {
		position: absolute;
		right: calc(100% + 0.6rem);
		top: 50%;
		transform: translateY(-50%) translateX(4px);
		background: rgba(30, 30, 30, 0.88);
		color: #fff;
		font-size: 0.8rem;
		font-weight: 500;
		white-space: nowrap;
		padding: 0.35rem 0.65rem;
		border-radius: 0.4rem;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.15s, transform 0.15s;
	}

	.scroll-top-btn:hover .scroll-top-tooltip {
		opacity: 1;
		transform: translateY(-50%) translateX(0);
	}
</style>