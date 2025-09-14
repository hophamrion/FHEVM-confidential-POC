"use client";

import { AllowanceForm } from "@/components/AllowanceForm";

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

      {/* Allowance Form */}
      <div className="max-w-2xl">
        <AllowanceForm />
      </div>
    </div>
  );
}
