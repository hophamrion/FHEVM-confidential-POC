import { DevPanel } from "@/components/DevPanel";

export default function DeveloperPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground">
          Debug tools, error decoder, and development utilities for the confidential token.
        </p>
      </div>

      {/* Developer Panel */}
      <DevPanel />
    </div>
  );
}
