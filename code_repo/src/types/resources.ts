export type ResourceCategory =
  | "Confidence"
  | "Coach Communication"
  | "Playing Time"
  | "Pressure & Anxiety"
  | "Goal Setting"
  | "Returning from Injury";

export type ResourceFormat = "article" | "video" | "worksheet" | "script";

export interface ResourceSection {
  heading: string;
  content: string;
  type?: "text" | "numbered-list" | "bullet-list" | "callout" | "script-line";
}

export interface Resource {
  slug: string;
  title: string;
  category: ResourceCategory;
  format: ResourceFormat;
  readTime: string;
  summary: string;
  sections: ResourceSection[];
  relatedSlugs: string[];
}
