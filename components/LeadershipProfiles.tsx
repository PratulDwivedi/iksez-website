import { chairman, directors, managingDirector } from "@/lib/leadership";

export default function LeadershipProfiles() {
  return (
    <>
      <div className="leadership-profile-grid">
        {[chairman, managingDirector].map((profile) => (
          <article
            className={`leadership-profile leadership-profile--${profile.role === "Chairman" ? "chairman" : "managing-director"}`}
            key={profile.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.image} alt={profile.name} loading="lazy" />
            <div>
              <span className="chip chip--green">{profile.role}</span>
              <h2>{profile.name}</h2>
              <p>{profile.bio}</p>
            </div>
          </article>
        ))}
      </div>

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
    </>
  );
}
