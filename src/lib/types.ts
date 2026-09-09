export interface LookCloserItem { label: string; text: string }

export interface DailyObject {
  id: number;
  display_date: string;
  met_object_id: number;
  title: string;
  artist_display_name: string | null;
  culture: string | null;
  period: string | null;
  dynasty: string | null;
  object_date: string | null;
  medium: string | null;
  department: string | null;
  primary_image: string;
  primary_image_small: string | null;
  met_object_url: string;
  summary: string | null;
  why_it_matters: string | null;
  look_closer: LookCloserItem[];
  created_at: string;
}

export type ArchiveObject = Pick<DailyObject, 'display_date' | 'title' | 'primary_image' | 'primary_image_small'>;
export type AdjacentObject = Pick<DailyObject, 'display_date'>;

export interface MetObject {
  objectID: number;
  title: string;
  isPublicDomain: boolean;
  primaryImage: string;
  primaryImageSmall: string | null;
  objectURL: string;
  artistDisplayName: string | null;
  culture: string | null;
  period: string | null;
  dynasty: string | null;
  objectDate: string | null;
  medium: string | null;
  department: string | null;
  objectName: string | null;
  classification: string | null;
  dimensions: string | null;
}

export type DailyObjectInsert = Omit<DailyObject, 'id' | 'created_at'> & { raw_metadata: Record<string, unknown> };
