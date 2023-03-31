<script lang="ts">
	import LargeSpinner from '$components/LargeSpinner.svelte';
	import SmallSpinner from '$components/SmallSpinner.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	export let data: PageData;
	// let page = 1;
	let currentPage = 1;

	const getPreviousUrl = () => {
		const url = $page.url;
		url.searchParams.append('page', (currentPage - 1).toString());

		return url;
	};

	const getNextUrl = (currentPage: number, continuationToken: string | null) => {
		const url = $page.url;
		url.searchParams.append('page', (currentPage + 1).toString());
		if (continuationToken) {
			url.searchParams.append('token', continuationToken);
		}

		return url;
	};

	$: path = data?.path || 's3://test-s3-listing-3846939';
	$: region = data?.region || 'us-east-2';
	$: directories = data?.directories || [];
	$: files = data?.files || [];
	$: error = data?.error;
	$: continuationToken = data?.token;

	$: console.dir({ data }, continuationToken);
	$: noData = !error && !directories.length && !files.length;
	$: currentPage = 1;
	$: nextUrl = getNextUrl(currentPage, continuationToken);
</script>

<svelte:head>
	<title>S3 Pagination with Svelte</title>
</svelte:head>

<div class="max-w-s p-4">
	<h1 class="text-xl mb-4">S3 Pagination with Svelte</h1>

	<div class="grid md:grid-cols-2 gap-3">
		<div>
			<p class="my-4">
				An example in Svelte that lists S3 objects with pagination via the continuation token (not
				using the SDK's paginators). <em>Note:</em> The S3 bucket must be public unless you're running
				this example locally where your AWS access keys are available.
			</p>
			<form>
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
		</div>

		<div class="flex flex-col justify-center">
			{#if noData}
				<div class="text-center">
					<p>Nothing to list, yet. Provide a bucket and region to list contents.</p>
				</div>
			{:else}
				<div class="">
					<div class="file-list max-h-96 overflow-y-scroll">
						{#if directories}
							<ul>
								{#each directories as dir}
									<li>
										<a href="#">
											<span class="icon">
												<svg
													fill="none"
													stroke="currentColor"
													stroke-width="1.5"
													viewBox="0 0 24 24"
													xmlns="http://www.w3.org/2000/svg"
													aria-hidden="true">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
												</svg></span>
											{dir}
										</a>
									</li>
								{/each}
							</ul>
						{/if}
						{#if files}
							<ul>
								{#each files as file}
									<li>
										<span class="icon">
											<svg
												fill="none"
												stroke="currentColor"
												stroke-width="1.5"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
												aria-hidden="true">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
											</svg>
										</span>
										{file}
									</li>
								{/each}
							</ul>
						{/if}
					</div>
					<!-- Previous Button -->
					<div class="pagination">
						<a
							href="?previous"
							class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
							Previous
						</a>

						<a
							href={nextUrl.href}
							class="inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
							Next
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.file-list {
		padding-left: 1.5rem;
	}

	.file-list li {
		margin-bottom: 0.25rem;
	}

	.icon {
		width: 16px;
		height: 16px;
		display: inline-block;
		vertical-align: middle;
	}

	.pagination {
		padding: 1.25rem;
		box-shadow: 0px -4px 4px -5px #333;
	}
</style>
