import { TransferForm } from "@/components/TransferForm";

export default function SendPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Send Tokens</h1>
        <p className="text-muted-foreground">
          Transfer confidential tokens to another address. Amounts are encrypted and private.
        </p>
      </div>

      {/* Transfer Form */}
      <div className="max-w-2xl">
        <TransferForm />
      </div>
    </div>
  );
}
