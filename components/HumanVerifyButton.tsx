"use client";

import {
  IDKitWidget,
  VerificationLevel,
  type ISuccessResult,
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

  async function handleVerify(proof: ISuccessResult) {
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
    <IDKitWidget
      action={action}
      app_id={appId}
      handleVerify={handleVerify}
      onSuccess={onVerified}
      signal={signal}
      verification_level={VerificationLevel.Orb}
    >
      {({ open }) => (
        <button onClick={open} type="button">
          {label}
        </button>
      )}
    </IDKitWidget>
  );
}
