import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye } from "lucide-react";

export default function ObserversPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Observers</h1>
        <p className="text-muted-foreground">
          Grant view access to your confidential token balance.
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Observer Management</span>
            <Badge variant="secondary" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </CardTitle>
          <CardDescription>
            This feature will allow you to grant other addresses permission to view your balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Feature Coming Soon</p>
            <p className="text-sm">
              The observer functionality will be implemented in the next sprint.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
