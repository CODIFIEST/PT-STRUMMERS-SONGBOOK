<script lang="ts">
	import './layout.css';
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();

	const isChristmas = $derived(page.url.pathname.startsWith('/christmas'));
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

<nav class="site-nav">
	<a href="/" class="nav-link" class:active={!isChristmas}>
		🎵 Main Songbook
	</a>
	<a href="/christmas" class="nav-link nav-link--christmas" class:active={isChristmas}>
		🎄 Christmas Songbook
	</a>
</nav>

{@render children()}

<style>
	.site-nav {
		display: flex;
		gap: 0.25rem;
		padding: 0.6rem 1.5rem 0;
		background: var(--fallback-b2, oklch(var(--b2)));
	}

	.nav-link {
		padding: 0.5rem 1.25rem;
		border-radius: 0.6rem 0.6rem 0 0;
		font-size: 0.95rem;
		font-weight: 600;
		text-decoration: none;
		color: #6b7280;
		background: transparent;
		transition: background 0.15s, color 0.15s;
	}

	.nav-link:hover {
		background: rgba(0,0,0,0.05);
		color: #374151;
	}

	.nav-link.active {
		background: var(--fallback-b1, oklch(var(--b1)));
		color: var(--fallback-p, oklch(var(--p)));
		box-shadow: 0 -2px 0 0 var(--fallback-p, oklch(var(--p))) inset;
	}

	.nav-link--christmas.active {
		color: #c0392b;
		box-shadow: 0 -2px 0 0 #c0392b inset;
	}
</style>