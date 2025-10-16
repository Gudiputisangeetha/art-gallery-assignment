// src/api/artApi.ts
export type Artwork = {
  id: number;
  title: string;
  place_of_origin: string | null;
  artist_display: string | null;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
  // plus any other fields the API returns in data
};

export type ArtResponse = {
  data: Artwork[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages?: number; // optional
  };
};

export async function fetchArtworksPage(page = 1, limit = 12): Promise<ArtResponse> {
  const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch page ${page}: ${res.status}`);
  const json = await res.json();
  // adapt to expected shape; the actual API has paging info under json.pagination
  return {
    data: json.data as Artwork[],
    pagination: {
      total: json.pagination?.total ?? 0,
      limit: json.pagination?.limit ?? limit,
      offset: json.pagination?.offset ?? (page - 1) * limit,
      total_pages: json.pagination?.total_pages ?? Math.ceil((json.pagination?.total ?? 0) / limit)
    }
  };
}
