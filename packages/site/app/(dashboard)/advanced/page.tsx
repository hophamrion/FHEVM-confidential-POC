import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Settings } from "lucide-react";

export default function AdvancedPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced</h1>
        <p className="text-muted-foreground">
          Advanced features including strict mode and supply management.
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Advanced Features</span>
            <Badge variant="secondary" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </CardTitle>
          <CardDescription>
            This section will include strict mode transfers, supply management, and other advanced features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Feature Coming Soon</p>
            <p className="text-sm">
              Advanced features will be implemented in the next sprint.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
