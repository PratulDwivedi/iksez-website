import type { Metadata } from "next";
import LeaderProfilePage from "@/components/LeaderProfilePage";
import { dileepSanghaniProfile as profile } from "@/lib/leaderProfiles";

export const metadata: Metadata = { title: profile.metaTitle, description: profile.metaDescription };

export default function DileepSanghaniPage() {
  return <LeaderProfilePage profile={profile} />;
}
