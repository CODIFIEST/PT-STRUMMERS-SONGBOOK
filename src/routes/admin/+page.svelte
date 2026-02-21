<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl justify-center mb-6">Upload Songs</h2>

			<form method="POST" action="?/upload" enctype="multipart/form-data" class="flex flex-col gap-4">
				<input
					type="password"
					name="password"
					placeholder="Admin Password"
					class="input input-bordered w-full"
					required
				/>

				<div class="form-control">
					<label class="label">
						<span class="label-text font-semibold">Upload to:</span>
					</label>
					<div class="flex gap-4">
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" name="bucket" value="sheet-music" class="radio radio-primary" checked />
							<span>🎵 Main Songbook</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" name="bucket" value="christmas-music" class="radio radio-error" />
							<span>🎄 Christmas</span>
						</label>
					</div>
				</div>

				<input
					type="file"
					name="files"
					accept="application/pdf"
					multiple
					class="file-input file-input-bordered file-input-primary w-full"
					required
				/>

				<button class="btn btn-primary mt-4">Upload</button>
			</form>

			{#if form?.success}
				<div class="alert alert-success mt-4"><span>Uploaded successfully!</span></div>
			{/if}
			{#if form?.error}
				<div class="alert alert-error mt-4"><span>{form.error}</span></div>
			{/if}

			<div class="flex gap-2 mt-4">
				<a href="/" class="btn btn-ghost btn-sm flex-1">🎵 Main Songbook</a>
				<a href="/christmas" class="btn btn-ghost btn-sm flex-1">🎄 Christmas</a>
			</div>
		</div>
	</div>
</div>