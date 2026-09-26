import type { Metadata } from "next";
import CtaBand from "@/components/CtaBand";
import { getLocale } from "@/lib/i18n/getDictionary";
import LeadershipProfiles, { LeadershipBanners } from "@/components/LeadershipProfiles";

export const metadata: Metadata = {
  title: "Management Team | IFFCO Kisan SEZ",
  description:
    "Leadership and Board of Directors of IFFCO Kisan SEZ, based on the current IFFCO leadership profiles.",
};

export default async function BoardOfDirectors() {
  const lang = await getLocale();
  return (
    <>
      {/* IFFCO-style full-bleed banners open the page instead of a PageHero. */}
      <h1 className="sr-only">Leadership</h1>
      <LeadershipBanners lang={lang} />

      <section className="section">
        <div className="container">
          <LeadershipProfiles />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
