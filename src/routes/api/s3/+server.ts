import { error, json, redirect } from '@sveltejs/kit';
import type { RequestEvent } from "./$types";
import { S3Client, ListObjectsV2Command, type ListObjectsV2CommandInput } from '@aws-sdk/client-s3';

let client = new S3Client({ region: 'us-east-2' });

const defaultRegion = "us-east-2";

export async function GET({ url }: RequestEvent) {
	const path = url.searchParams.get('path') as string;
	const region = url.searchParams.get('region') as string;
	const token = url.searchParams.get('token') as string;

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
	const { NextContinuationToken, Contents, CommonPrefixes } = response;

	if (Array.isArray(CommonPrefixes)) {
		for (const prefix of CommonPrefixes) {
			if (prefix.Prefix) {
				directories.push(prefix.Prefix.replace(key, ""))
			}
		}
	}

	if (Array.isArray(Contents)) {
		for (const object of Contents) {
			if (object.Key) {
				files.push(object.Key.replace(key, ""))
			}
		}
	}

	console.log({ directories, files });

	return json({
		directories,
		files,
		token: NextContinuationToken,
	})
}
