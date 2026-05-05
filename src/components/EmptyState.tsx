import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    to?: string;
    icon?: LucideIcon;
  };
  secondary?: {
    label: string;
    onClick?: () => void;
    to?: string;
  };
  className?: string;
}

const EmptyState = ({ icon: Icon, title, description, action, secondary, className }: EmptyStateProps) => {
  const ActionIcon = action?.icon;
  return (
    <Card className={cn("p-12 text-center glass relative overflow-hidden", className)}>
      {/* dezenter Goldglow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        {Icon && (
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold/10 ring-1 ring-primary/20">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        )}
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">{description}</p>
        )}
        {(action || secondary) && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {action && (
              action.to ? (
                <Button asChild className="bg-gradient-gold text-primary-foreground shadow-gold">
                  <Link to={action.to}>
                    {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </Link>
                </Button>
              ) : (
                <Button onClick={action.onClick} className="bg-gradient-gold text-primary-foreground shadow-gold">
                  {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              )
            )}
            {secondary && (
              secondary.to ? (
                <Button asChild variant="outline">
                  <Link to={secondary.to}>{secondary.label}</Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={secondary.onClick}>{secondary.label}</Button>
              )
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default EmptyState;
