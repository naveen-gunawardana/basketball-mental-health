import { resources, getResourceBySlug, getRelatedResources } from "@/data/resources";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return resources.map((r) => ({ slug: r.slug }));
}

export default function ResourceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const resource = getResourceBySlug(params.slug);

  if (!resource) {
    notFound();
  }

  const related = getRelatedResources(resource);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/resources"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Resources
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="secondary">{resource.category}</Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {resource.readTime} read
          </span>
          <span className="text-sm text-muted-foreground capitalize">
            {resource.format}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">
          {resource.title}
        </h1>
        <p className="text-lg text-muted-foreground">{resource.summary}</p>
      </div>

      {/* Content sections */}
      <div className="space-y-8">
        {resource.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-navy mb-3">
              {section.heading}
            </h2>

            {section.type === "callout" ? (
              <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                <p className="text-sm text-navy whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ) : section.type === "script-line" ? (
              <div className="rounded-lg bg-navy-50 border border-navy-100 p-4">
                <p className="text-sm italic text-navy font-medium whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ) : section.type === "numbered-list" ? (
              <div className="space-y-3">
                {section.content.split("\n").map((line, j) => (
                  <p key={j} className="text-sm text-foreground leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            ) : section.type === "bullet-list" ? (
              <div className="space-y-2">
                {section.content.split("\n").map((line, j) => (
                  <p key={j} className="text-sm text-foreground leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {section.content.split("\n\n").map((paragraph, j) => (
                  <p
                    key={j}
                    className="text-sm text-foreground leading-relaxed whitespace-pre-line"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Related resources */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold text-navy mb-4">
            Related Resources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link key={r.slug} href={`/resources/${r.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {r.category}
                    </Badge>
                    <h4 className="font-medium text-navy text-sm mb-1">
                      {r.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {r.readTime}
                      <ArrowRight className="h-3 w-3 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
