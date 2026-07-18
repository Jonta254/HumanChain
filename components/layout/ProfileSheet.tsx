"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Calendar, MessageCircleQuestion, ShoppingBag, Sparkles, Store, UserPlus, UserMinus } from "lucide-react";
import { Button, Drawer, DrawerContent, DrawerHeader, DrawerTitle, Haptic, Spinner, Typography } from "@worldcoin/mini-apps-ui-kit-react";
import { fetchProfile, followUser, unfollowUser } from "@/lib/humanchain/profile";
import type { PublicProfile } from "@/types/profile";
import type { HumanIdentity } from "@/types/user";

type Status = "loading" | "ready" | "error" | "notFound" | "pendingSetup";

export function ProfileSheet({
  act,
  humanIdentity,
  onClose,
  wallet,
}: {
  act: (title: string, detail: string) => void;
  humanIdentity: HumanIdentity | null;
  onClose: () => void;
  wallet: string;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Relies on the caller mounting a fresh ProfileSheet per wallet (see
    // HumanChainRoot's key={viewingProfileWallet}) rather than resetting
    // status here — status already starts "loading" from useState.
    void fetchProfile(wallet).then((result) => {
      if (cancelled) return;
      if (result.ok) { setProfile(result.profile); setStatus("ready"); return; }
      if (result.notFound) { setStatus("notFound"); return; }
      if (result.pendingSetup) { setStatus("pendingSetup"); return; }
      setStatus("error");
    });
    return () => { cancelled = true; };
  }, [wallet]);

  async function toggleFollow() {
    if (!profile || followBusy) return;
    setFollowBusy(true);
    const wasFollowing = profile.isFollowing;
    setProfile({ ...profile, isFollowing: !wasFollowing, followerCount: profile.followerCount + (wasFollowing ? -1 : 1) });
    const result = wasFollowing ? await unfollowUser(wallet) : await followUser(wallet);
    if (!result.ok) {
      setProfile((cur) => cur ? { ...cur, isFollowing: wasFollowing, followerCount: cur.followerCount + (wasFollowing ? 1 : -1) } : cur);
      act("Couldn't update", result.pendingSetup ? "Following isn't available yet." : "Try again in a moment.");
    }
    setFollowBusy(false);
  }

  return (
    <Drawer open onOpenChange={(open) => { if (!open) onClose(); }} height="full">
      <DrawerContent>
        <DrawerHeader icon={<BadgeCheck size={20} />}>
          <DrawerTitle>{profile?.username ?? "Profile"}</DrawerTitle>
        </DrawerHeader>

        <div className="profile-sheet-body">
          {status === "loading" && (
            <div className="profile-sheet-state"><Spinner /></div>
          )}
          {status === "notFound" && (
            <div className="profile-sheet-state">
              <Typography variant="body" level={2}>This person hasn&apos;t joined HumanChain yet, or hasn&apos;t signed in with World ID.</Typography>
            </div>
          )}
          {status === "pendingSetup" && (
            <div className="profile-sheet-state">
              <Typography variant="body" level={2}>Profiles aren&apos;t available yet — check back soon.</Typography>
            </div>
          )}
          {status === "error" && (
            <div className="profile-sheet-state">
              <Typography variant="body" level={2}>Couldn&apos;t load this profile. Try again.</Typography>
            </div>
          )}
          {status === "ready" && profile && (
            <>
              <div className="profile-sheet-identity">
                <div className="profile-sheet-avatar">{profile.username.replace(/^@/, "").charAt(0).toUpperCase()}</div>
                <strong>{profile.username}</strong>
                <span className="profile-sheet-tier"><BadgeCheck size={13} />{profile.tier} tier</span>
                <span className="profile-sheet-joined"><Calendar size={12} />Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
              </div>

              {profile.restricted ? (
                <div className="profile-sheet-state">
                  <Typography variant="body" level={2}>This profile is private.</Typography>
                </div>
              ) : (
                <>
                  {profile.bio && <p className="profile-sheet-bio">{profile.bio}</p>}

                  <div className="profile-sheet-follow-row">
                    <span><strong>{profile.followerCount}</strong> followers</span>
                    <span><strong>{profile.followingCount}</strong> following</span>
                  </div>

                  {!profile.isSelf && humanIdentity?.wallet && (
                    <Haptic variant="selection" asChild>
                      <Button
                        variant={profile.isFollowing ? "secondary" : "primary"}
                        fullWidth
                        disabled={followBusy}
                        onClick={() => void toggleFollow()}
                        type="button"
                      >
                        {profile.isFollowing ? <UserMinus size={15} /> : <UserPlus size={15} />}
                        {profile.isFollowing ? "Following" : "Follow"}
                      </Button>
                    </Haptic>
                  )}

                  <div className="profile-sheet-stats">
                    <div className="profile-sheet-stat"><Sparkles size={14} /><strong>{profile.points ?? "—"}</strong><span>points</span></div>
                    <div className="profile-sheet-stat"><Sparkles size={14} /><strong>{profile.streak ?? "—"}</strong><span>day streak</span></div>
                    {profile.contributions && (
                      <div className="profile-sheet-stat"><MessageCircleQuestion size={14} /><strong>{profile.contributions.answers}</strong><span>answers</span></div>
                    )}
                    {profile.marketplaceSummary && (
                      <div className="profile-sheet-stat"><Store size={14} /><strong>{profile.marketplaceSummary.soldListings}</strong><span>sold</span></div>
                    )}
                  </div>

                  {profile.recentActivity && profile.recentActivity.length > 0 && (
                    <div className="profile-sheet-activity">
                      <span className="profile-sheet-section-label">Recent activity</span>
                      {profile.recentActivity.map((item, i) => (
                        <div className="profile-sheet-activity-row" key={i}>
                          {item.type === "listing" ? <ShoppingBag size={13} /> : item.type === "answer" || item.type === "question" ? <MessageCircleQuestion size={13} /> : <Sparkles size={13} />}
                          <span>{item.text.slice(0, 90)}{item.text.length > 90 ? "…" : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {profile.recentActivity && profile.recentActivity.length === 0 && !profile.marketplaceSummary?.activeListings && (
                    <p className="profile-sheet-empty">No public activity yet.</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
