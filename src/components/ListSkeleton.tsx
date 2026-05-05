import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ListSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <Card className="glass overflow-hidden">
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  </Card>
);

export const CardGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-6 glass space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </Card>
    ))}
  </div>
);

export default ListSkeleton;
