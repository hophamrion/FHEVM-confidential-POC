import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield } from "lucide-react";

export default function AllowancePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Allowance</h1>
        <p className="text-muted-foreground">
          Approve and manage spending allowances for confidential tokens.
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Allowance Management</span>
            <Badge variant="secondary" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </CardTitle>
          <CardDescription>
            This feature will allow you to approve spending allowances and transfer tokens on behalf of others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Feature Coming Soon</p>
            <p className="text-sm">
              The allowance functionality will be implemented in the next sprint.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
