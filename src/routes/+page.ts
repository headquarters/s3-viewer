
import type { PageLoadEvent } from "./$types";

interface LoadResponse {
  path: string;
  region: string;
  directories: string[],
  files: string[],
  token: string | null;
  error: string | null;
}

export async function load({ url, fetch }: PageLoadEvent): Promise<LoadResponse> {
  const path = url.searchParams.get('path') as string;
  const region = url.searchParams.get('region') as string;
  // const token = url.searchParams.get('token') as string;

  if (path && region) {
    const response = await fetch(`/api/s3?${url.searchParams.toString()}`);

    const data = await response.json();
    return data;
  }

  return {
    path: "",
    region: "",
    directories: [],
    files: [],
    token: null,
    error: "Path and region are required."
  };
}
