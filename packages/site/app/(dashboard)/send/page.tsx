"use client";

import { TransferForm } from "@/components/TransferForm";
import { BatchTransferForm } from "@/components/BatchTransferForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Users } from "lucide-react";

export default function SendPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Send Tokens</h1>
        <p className="text-muted-foreground">
          Transfer confidential tokens to one or multiple addresses. Amounts are encrypted and private.
        </p>
      </div>

      {/* Transfer Forms */}
      <div className="max-w-4xl">
        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Single Transfer</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Batch Transfer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <TransferForm />
          </TabsContent>

          <TabsContent value="batch">
            <BatchTransferForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
