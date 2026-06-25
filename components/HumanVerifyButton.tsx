"use client";

import { useEffect, useState } from "react";
import {
  CredentialRequest,
  IDKitRequestWidget,
  type IDKitResult,
  type RpContext,
} from "@worldcoin/idkit";
import { Button, Haptic, Spinner, VerificationBadge } from "@worldcoin/mini-apps-ui-kit-react";
import { getWorldAppId } from "@/lib/worldConfig";

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
  const appId = getWorldAppId() as `app_${string}`;
  const [isOpen, setIsOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [verificationReady, setVerificationReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/world/rp-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
      .then((response) => response.json())
      .then((data: { ok?: boolean; rpContext?: RpContext }) => {
        if (!isMounted) return;
        setRpContext(data.rpContext ?? null);
        setVerificationReady(Boolean(data.ok && data.rpContext));
      })
      .catch(() => {
        if (!isMounted) return;
        setRpContext(null);
        setVerificationReady(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [action]);

  async function handleVerify(proof: IDKitResult) {
    const response = await fetch("/api/world/verify-proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idkitResponse: proof, action, signal }),
    });

    if (!response.ok) {
      throw new Error("Human verification failed.");
    }
  }

  function handleClick() {
    if (verificationReady) {
      setIsOpen(true);
    } else {
      onVerified?.();
    }
  }

  return (
    <>
      <Haptic variant="impact" type="medium" asChild>
        <Button
          variant="primary"
          fullWidth
          type="button"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? (
            <Spinner />
          ) : verificationReady ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <VerificationBadge verified />
              {label}
            </span>
          ) : (
            fallbackLabel
          )}
        </Button>
      </Haptic>

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
