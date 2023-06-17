
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



  if (path && region) {
    try {
      const response = await fetch(`/api/s3?${url.searchParams.toString()}`);

      if (!response.ok) {
        // TODO: this is throwing a 500 but not capturing credentials error
        throw new Error(response.statusText);
      }

      const data = await response.json();

      return data;
    } catch (e) {
      return {
        path,
        region,
        directories: [],
        files: [],
        token: null,
        error: e.message,
      }
    }
  }

  return {
    path: "",
    region: "",
    directories: [],
    files: [],
    token: null,
    error: null
  };
}
