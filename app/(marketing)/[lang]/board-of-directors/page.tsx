import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import LeadershipProfiles from "@/components/LeadershipProfiles";

export const metadata: Metadata = {
  title: "Management Team | IFFCO Kisan SEZ",
  description:
    "Leadership and Board of Directors of IFFCO Kisan SEZ, based on the current IFFCO leadership profiles.",
};

export default function BoardOfDirectors() {
  return (
    <>
      <PageHero title="Leadership" banner="/images/about-us-banner.webp" />

      <section className="section">
        <div className="container">
          <LeadershipProfiles />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
