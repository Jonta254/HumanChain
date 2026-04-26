"use client";

import { useEffect, useState } from "react";
import {
  CredentialRequest,
  IDKitRequestWidget,
  type IDKitResult,
  type RpContext,
} from "@worldcoin/idkit";

type HumanVerifyButtonProps = {
  action: string;
  signal?: string;
  label: string;
  onVerified?: () => void;
};

export function HumanVerifyButton({
  action,
  signal,
  label,
  onVerified,
}: HumanVerifyButtonProps) {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`;
  const [isOpen, setIsOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/world/rp-context")
      .then((response) => response.json())
      .then((data: { rpContext: RpContext }) => {
        if (isMounted) setRpContext(data.rpContext);
      })
      .catch(() => {
        if (isMounted) setRpContext(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleVerify(proof: IDKitResult) {
    const response = await fetch("/api/world/verify-proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idkitResponse: proof,
        action,
        signal,
      }),
    });

    if (!response.ok) {
      throw new Error("Human verification failed.");
    }
  }

  return (
    <>
      <button
        disabled={!rpContext}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {label}
      </button>
      {rpContext ? (
        <IDKitRequestWidget
          action={action}
          allow_legacy_proofs={false}
          app_id={appId}
          autoClose
          constraints={CredentialRequest("proof_of_human", { signal })}
          handleVerify={handleVerify}
          onOpenChange={setIsOpen}
          onSuccess={() => onVerified?.()}
          open={isOpen}
          rp_context={rpContext}
        />
      ) : null}
    </>
  );
}
