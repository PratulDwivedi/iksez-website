import CtaBand from "@/components/CtaBand";
import ElfsightWidget from "@/components/ElfsightWidget";
import LeaderGallery from "@/components/LeaderGallery";
import XPosts from "@/components/XPosts";
import { LEADER_LEAF, type LeaderProfileContent } from "@/lib/leaderProfiles";
import { formatXCount, getXProfileStats } from "@/lib/xProfile";

const X_ICON = "M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.9 2h6.4l4.4 5.9L18.9 2Zm-1.1 18.1h1.7L7.3 3.8H5.5l12.3 16.3Z";

/* eslint-disable @next/next/no-img-element */

// A leader's profile page, laid out like the leadership profiles on iffco.in:
// hero, highlights band, feature blocks, photo gallery and Social Corner.
export default async function LeaderProfilePage({ profile }: { profile: LeaderProfileContent }) {
  const { hero, highlights, features, gallery, social } = profile;
  const stats = social.elfsightWidgetId ? null : await getXProfileStats(social.handle);

  return (
    <div className="leader-page">
      {/* ================= HERO ================= */}
      <section className="leader-hero">
        <div className="container leader-hero__grid">
          <h1 className="leader-hero__title">{hero.title}</h1>
          <div className="leader-hero__intro">
            <p>{hero.intro}</p>
            <h2>{hero.name}</h2>
            <a className="leader-hero__follow" href={`https://x.com/${social.handle}`} target="_blank" rel="noopener noreferrer">
              <span>Follow on</span>
              <svg viewBox="0 0 24 24" aria-label="X" role="img">
                <path d={X_ICON} />
              </svg>
            </a>
          </div>
          <img className="leader-hero__photo" src={hero.image} alt={hero.name} />
        </div>
      </section>

      {/* ================= HIGHLIGHTS ================= */}
      <section className="leader-torch">
        <div className="container">
          <h2 className="leader-heading">{highlights.heading}</h2>
          <div className="leader-torch__grid">
            {highlights.rows.map((row, i) => (
              <div className={`leader-torch__row${i % 2 ? " leader-torch__row--flip" : ""}`} key={row.image}>
                <img src={row.image} alt="" loading="lazy" />
                <div className="leader-torch__text">
                  <div>
                    {row.title && <p className="leader-torch__title">{row.title}</p>}
                    {row.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURE BLOCKS ================= */}
      {features.map((feature) =>
        feature.layout === "overlap" ? (
          <section className="leader-overlap" key={feature.title}>
            <div className="container">
              <div className="leader-overlap__wrap">
                <img className="leader-leaf leader-overlap__leaf" src={LEADER_LEAF} alt="" aria-hidden="true" />
                <img className="leader-overlap__photo" src={feature.image} alt="" loading="lazy" />
                <div className="leader-overlap__box">
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <img src={feature.smallImage} alt="" loading="lazy" />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="leader-split" key={feature.title}>
            <div className="container">
              <div className="leader-split__wrap">
                <img className="leader-leaf leader-split__leaf" src={LEADER_LEAF} alt="" aria-hidden="true" />
                <div className="leader-split__box">
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
                <img className="leader-split__photo" src={feature.image} alt="" loading="lazy" />
              </div>
            </div>
          </section>
        ),
      )}

      {/* ================= GALLERY ================= */}
      <section className="leader-gallery-section">
        <LeaderGallery tabs={gallery} />
      </section>

      {/* ================= SOCIAL CORNER =================
          iffco.in uses Elfsight widgets tied to IFFCO's own account; this
          rebuilds the same profile card: live counts (lib/xProfile.ts) and X's
          official post embeds. Setting social.elfsightWidgetId swaps in a
          self-updating Elfsight feed instead. */}
      <section className="leader-social">
        <div className="container">
          <h2 className="leader-social__title">Social Corner</h2>
          {social.elfsightWidgetId ? (
            <ElfsightWidget id={social.elfsightWidgetId} />
          ) : (
            <div className="x-profile">
              <img className="x-profile__banner" src={social.banner} alt="" loading="lazy" />
              <div className="x-profile__head">
                <img className="x-profile__avatar" src={social.avatar} alt="" loading="lazy" />
                <div className="x-profile__who">
                  <strong>
                    {social.displayName}
                    <svg className="x-profile__verified" viewBox="0 0 22 22" aria-label="Verified account" role="img">
                      <path d="M20.4 11c0-1.3-.8-2.5-1.9-3 .4-1.2.2-2.6-.7-3.5-.9-.9-2.3-1.2-3.5-.7-.5-1.2-1.7-2-3-2s-2.5.8-3 1.9c-1.2-.4-2.6-.2-3.5.7-.9.9-1.2 2.3-.7 3.5-1.2.5-2 1.7-2 3s.8 2.5 1.9 3c-.4 1.2-.2 2.6.7 3.5.9.9 2.3 1.2 3.5.8.5 1.1 1.7 1.9 3 1.9s2.5-.8 3-1.9c1.2.4 2.6.1 3.5-.8.9-.9 1.2-2.3.8-3.5 1.1-.5 1.9-1.7 1.9-3Z" />
                      <path d="m9.6 14.9-3.4-3.4 1.3-1.3 2.1 2.1 4.8-5.3 1.4 1.3z" fill="#fff" />
                    </svg>
                  </strong>
                  <span>@{social.handle}</span>
                </div>
                <a className="x-profile__follow" href={`https://x.com/intent/follow?screen_name=${social.handle}`} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={X_ICON} /></svg>
                  Follow
                </a>
              </div>
              {stats && (
                <dl className="x-profile__stats">
                  <div><dt>Posts</dt><dd>{formatXCount(stats.posts)}</dd></div>
                  <div><dt>Following</dt><dd>{formatXCount(stats.following)}</dd></div>
                  <div><dt>Followers</dt><dd>{formatXCount(stats.followers)}</dd></div>
                </dl>
              )}
              <XPosts handle={social.handle} postIds={social.postIds} />
            </div>
          )}
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
