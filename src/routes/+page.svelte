<script lang="ts">
	import LargeSpinner from '$components/LargeSpinner.svelte';
	import SmallSpinner from '$components/SmallSpinner.svelte';
	import type { ActionData } from './$types';
	export let form: ActionData;
	let path = form?.path || 's3://test-s3-listing-3846939';
	let region = form?.region || 'us-east-2';
	let directories = form?.directories || [];
	let files = form?.files || [];
</script>

<svelte:head>
	<title>S3 Pagination with Svelte</title>
</svelte:head>

<div class="max-w-s p-4">
	<h1 class="text-xl mb-4">S3 Pagination with Svelte</h1>
	<p class="my-4">
		An example in Svelte that lists S3 objects with pagination via the continuation token (not using
		the SDK's paginators). <em>Note:</em> The S3 bucket must be public unless you're running this example
		locally where your AWS access keys are available.
	</p>

	<form method="POST">
		<div class="max-w-xs mb-4">
			<label for="path" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
				>S3 Path</label>
			<input
				type="text"
				id="path"
				name="path"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				value={path}
				required />
		</div>

		<div class="max-w-xs">
			<label for="region" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
				>Region</label>
			<input
				type="text"
				id="region"
				name="region"
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				value={region}
				required />
		</div>

		<button
			type="submit"
			class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
			List Objects
		</button>
	</form>

	{#each directories as dir}
		{dir}
	{/each}
	{#each files as file}
		{file}
	{/each}
</div>
