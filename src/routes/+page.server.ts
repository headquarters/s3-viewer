import { fail } from '@sveltejs/kit';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

let client = new S3Client({ region: 'us-east-2' });

const defaultRegion = "us-east-2";

export const actions = {

  default: async ({ request }) => {
    const data = await request.formData();
    const path = data.get('path') as string;
    const region = data.get('region') as string;

    if (!path) {
      return fail(400, { path, invalid: true });
    }

    if (!region) {
      return fail(400, { region, invalid: true });
    }

    if (region !== defaultRegion) {
      client = new S3Client({ region });
    }

    let fullPath = path;

    if (path.substring(0, 5) !== "s3://") {
      fullPath = `s3://${path}`;
    }

    const url = new URL(fullPath);

    const bucket = url.hostname;
    // remove leading slash from keys
    const key = url.pathname.substring(1);

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: key,
      Delimiter: '/',
      MaxKeys: 30
    });


    const response = await client.send(command);
    const directories: string[] = [];
    const files: string[] = [];

    const { NextContinuationToken, IsTruncated, Contents, CommonPrefixes } = response;

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

    console.log({ response });

    return {
      success: true,
      directories,
      files,
      path,
      region
    };
  }
};
