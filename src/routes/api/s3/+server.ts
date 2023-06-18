import { json } from '@sveltejs/kit';
import type { RequestEvent } from "./$types";
import { S3Client, ListObjectsV2Command, type ListObjectsV2CommandInput } from '@aws-sdk/client-s3';

let client: S3Client;

const defaultRegion = "us-east-2";

if (process.env.$NETLIFY === "true") {
	// `AWS_ACCESS_KEY_ID` is a reserved ENV variable in Netlify, so use a prefixed version there.
	client = new S3Client({ credentials: { accessKeyId: process.env.SVELTE_AWS_ACCESS_KEY_ID as string, secretAccessKey: process.env.SVELTE_AWS_SECRET_ACCESS_KEY as string }, region: 'us-east-2' });
} else {
	client = new S3Client({ region: defaultRegion })
}

export async function GET({ url }: RequestEvent) {
	const path = url.searchParams.get('path') as string;
	const region = url.searchParams.get('region') as string;
	const token = url.searchParams.get('token') as string;

	if (region !== defaultRegion) {
		client = new S3Client({ region });
	}

	let fullPath = path;

	if (path.substring(0, 5) !== "s3://") {
		fullPath = `s3://${path}`;
	}

	const s3Url = new URL(fullPath);

	const bucket = s3Url.hostname;
	// remove leading slash from keys
	const key = s3Url.pathname.substring(1);

	const commandOptions: ListObjectsV2CommandInput = {
		Bucket: bucket,
		Prefix: key,
		Delimiter: '/',
		MaxKeys: 20,
		ContinuationToken: token
	};

	if (token) {
		commandOptions.ContinuationToken = token;
	}

	const command = new ListObjectsV2Command(commandOptions);

	const response = await client.send(command);
	const directories: string[] = [];
	const files: string[] = [];
	const { NextContinuationToken = null, Contents, CommonPrefixes } = response;

	if (Array.isArray(CommonPrefixes)) {
		for (const prefix of CommonPrefixes) {
			if (prefix.Prefix) {
				directories.push(prefix.Prefix.substring(key.length))
			}
		}
	}

	if (Array.isArray(Contents)) {
		for (const object of Contents) {
			if (object.Key && object.Key.length !== key.length) {
				files.push(object.Key.substring(key.length))
			}
		}
	}

	return json({
		path,
		directories,
		files,
		token: NextContinuationToken,
	})
}
