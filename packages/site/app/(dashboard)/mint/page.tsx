import { MintForm } from "@/components/MintForm";

export default function MintPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mint Tokens</h1>
        <p className="text-muted-foreground">
          Create new confidential tokens. Only the contract owner can mint.
        </p>
      </div>

      {/* Mint Form */}
      <div className="max-w-2xl">
        <MintForm />
      </div>
    </div>
  );
}
