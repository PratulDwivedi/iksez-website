import Link from "next/link";
import { chairman, directors, managingDirector } from "@/lib/leadership";
import { localizePath, type Locale } from "@/lib/i18n/config";

const IFFCO_LEADERSHIP_URL = "https://www.iffco.in/en/leadership";

export function LeadershipBanners({ lang }: { lang: Locale }) {
  return (
    <div className="leadership-banners">
      {[chairman, managingDirector].map((profile) => {
        const isChairman = profile.role === "Chairman";
        const [lead, ...rest] = profile.bio.split(profile.name);
        return (
          <article
            className={`leadership-banner leadership-banner--${isChairman ? "chairman" : "managing-director"}`}
            key={profile.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="leadership-banner__image" src={profile.image} alt={profile.name} />
            <div className="leadership-banner__content">
              <h2>
                {profile.name} <span>({profile.role})</span>
              </h2>
              <div className="leadership-banner__bio">
                <p>
                  {/* The chairman's bio opens with his name in bold, as on IFFCO's page. */}
                  {isChairman && rest.length ? (
                    <>
                      {lead}
                      <strong>{profile.name}</strong>
                      {rest.join(profile.name)}
                    </>
                  ) : (
                    profile.bio
                  )}
                </p>
                {profile.profilePath ? (
                  <Link className="leadership-banner__more" href={localizePath(profile.profilePath, lang)}>
                    Read More
                  </Link>
                ) : (
                  <a className="leadership-banner__more" href={IFFCO_LEADERSHIP_URL} target="_blank" rel="noopener noreferrer">
                    Read More
                  </a>
                )}
                {profile.twitter && (
                  <a className="leadership-banner__follow" href={profile.twitter} target="_blank" rel="noopener noreferrer">
                    <span>Follow on</span>
                    <svg viewBox="0 0 24 24" aria-label="X" role="img">
                      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.9 2h6.4l4.4 5.9L18.9 2Zm-1.1 18.1h1.7L7.3 3.8H5.5l12.3 16.3Z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function LeadershipProfiles() {
  return (
    <div className="leadership-directors">
      <div className="section-head">
        <span className="eyebrow">Board of Directors</span>
        <h2>Leadership from the cooperative movement</h2>
      </div>
      <div className="grid leadership-directors__grid">
        {directors.map((director) => (
          <article className="leadership-director" key={director.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={director.image} alt={director.name} loading="lazy" />
            <div>
              <h3>{director.name}</h3>
              <strong>{director.role}</strong>
              {director.organization && <p>{director.organization}</p>}
              <p>{director.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
