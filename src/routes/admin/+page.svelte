<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl justify-center mb-6">Upload Song</h2>

			<form method="POST" action="?/upload" enctype="multipart/form-data" class="flex flex-col gap-4">
				<input type="password" name="password" placeholder="Admin Password" class="input input-bordered w-full" required />
                <input type="file"     name="files"  accept="application/pdf"
    multiple      class="file-input file-input-bordered file-input-primary w-full"
    required/>
				<button class="btn btn-primary mt-4">Upload</button>
			</form>

			{#if form?.success}
				<div class="alert alert-success mt-4"><span>Uploaded!</span></div>
			{/if}
			{#if form?.error}
				<div class="alert alert-error mt-4"><span>{form.error}</span></div>
			{/if}

			<a href="/" class="btn btn-ghost btn-sm mt-4">← Back to Songs</a>
		</div>
	</div>
</div>