"use client";

import { BurnForm } from "@/components/BurnForm";

export default function BurnPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Burn Tokens</h1>
        <p className="text-muted-foreground">
          Permanently destroy confidential tokens to reduce supply.
        </p>
      </div>

      {/* Burn Form */}
      <div className="max-w-2xl">
        <BurnForm />
      </div>
    </div>
  );
}
