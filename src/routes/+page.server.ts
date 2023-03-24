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
      MaxKeys: 10
    });


    const response = await client.send(command);

    const { NextContinuationToken, IsTruncated, Contents, CommonPrefixes } = response;

    console.log({ response });

    return {
      success: true,
      path,
      region
    };
  }
};
