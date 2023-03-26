import { S3Client, ListObjectsV2Command, type ListObjectsV2CommandInput } from '@aws-sdk/client-s3';
import type { PageServerLoadEvent } from "./$types";

let client = new S3Client({ region: 'us-east-2' });

const defaultRegion = "us-east-2";

interface LoadResponse {
  path: string;
  region: string;
  directories: string[],
  files: string[],
  continuationToken: string | null;
  error: string | null;
}

export async function load({ url }: PageServerLoadEvent): Promise<LoadResponse> {
  const path = url.searchParams.get('path') as string;
  const region = url.searchParams.get('region') as string;
  const token = url.searchParams.get('token') as string;

  const loadResponse: LoadResponse = {
    path,
    region,
    directories: [],
    files: [],
    continuationToken: null,
    error: null,
  };

  if (!path) {
    loadResponse.error = "No path provided.";

    return loadResponse;
  }

  if (!region) {
    loadResponse.error = "No region provided.";

    return loadResponse;
  }

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
    MaxKeys: 20
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

  loadResponse.directories = directories;
  loadResponse.files = files;
  loadResponse.continuationToken = NextContinuationToken ?? null;

  return loadResponse;
}
