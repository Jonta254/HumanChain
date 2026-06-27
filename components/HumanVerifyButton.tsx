"use client";

import { useEffect, useState } from "react";
import {
  CredentialRequest,
  IDKitRequestWidget,
  type IDKitResult,
  type RpContext,
} from "@worldcoin/idkit";
import { recordWorldHumanProofEvent } from "@/lib/humanchain/worldSession";
import { getPublicWorldAppId } from "@/lib/worldConfig";

type HumanVerifyButtonProps = {
  action: string;
  signal?: string;
  label: string;
  fallbackLabel?: string;
  onVerified?: () => void;
};

export function HumanVerifyButton({
  action,
  fallbackLabel = "Continue",
  signal,
  label,
  onVerified,
}: HumanVerifyButtonProps) {
  const appId = getPublicWorldAppId() as `app_${string}`;
  const [isOpen, setIsOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [verificationReady, setVerificationReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/world/rp-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
      .then((response) => response.json())
      .then((data: { ok?: boolean; rpContext?: RpContext }) => {
        if (!isMounted) {
          return;
        }

        setRpContext(data.rpContext ?? null);
        setVerificationReady(Boolean(data.ok && data.rpContext));
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setRpContext(null);
        setVerificationReady(false);
      });

    return () => {
      isMounted = false;
    };
  }, [action]);

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

    recordWorldHumanProofEvent({ action, signal });
  }

  return (
    <>
      <button
        onClick={() => {
          if (verificationReady) {
            setIsOpen(true);
            return;
          }

          onVerified?.();
        }}
        type="button"
      >
        {verificationReady ? label : fallbackLabel}
      </button>
      {verificationReady && rpContext ? (
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
