import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "News and Events | IFFCO Kisan SEZ",
  description:
    "News and events from IFFCO Kisan SEZ — CSR medical camps, official visits and community initiatives at SPSR Nellore.",
};

export default function NewsAndEvents() {
  return (
    <>
      <PageHero title="Media" subtitle="News and Events" banner="/images/media-banner.webp" />

      <section className="section section--tight">
        <div className="container">
          <div className="chip-row" data-reveal="">
            <Link className="btn btn--brand btn--sm" href="/news-and-events/">
              News and Events
            </Link>
            <Link className="btn btn--outline btn--sm" href="/gallery/">
              Image Gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container container--narrow">
          {/* ---------- 1 ---------- */}
          <article className="news-item" data-reveal="">
            <span className="news-item__date">26.09.2024</span>
            <h3>Free Medical Camp in Racharlapadu Village- 26.09.2024</h3>
            <p>
              Free Medical camp was conducted in the Racharlapadu village on 26.09.2024 as part of
              CSR activities in association with Apollo Hospitals, Nellore. About 160 people from
              the village have attended in the medical camp. ECG, BP and Sugar levels were also
              monitored. Free medicines were provided to the villagers. Consultation with Senior
              Orthopaedic doctor was also provided in the medical camp. Villagers have also
              requested IKSEZ for conducting a Veterinary camp for cattle in their village.
            </p>
            <div className="news-item__gallery">
              {["medical-1", "medical-2", "medical-3", "medical-4"].map((name) => (
                <a
                  className="gallery__item"
                  key={name}
                  href={`/images/${name}.jpg`}
                  data-lightbox=""
                  data-caption="Free Medical Camp in Racharlapadu Village"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${name}.jpg`}
                    alt="Free Medical Camp in Racharlapadu Village"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </article>

          {/* ---------- 2 ---------- */}
          <article className="news-item" data-reveal="">
            <span className="news-item__date">18.09.2024</span>
            <h3>Free Medical Camp in Regadichilaka Village- 18.09.2024</h3>
            <p>
              Free Medical camp was conducted in the Regadichilaka village on 18.09.2024 as part
              of CSR activities in association with Apollo Hospitals, Nellore. About 130 people
              from the village have attended in the medical camp. ECG, BP and Sugar levels were
              also monitored. Free medicines were provided to the villagers. Consultation with
              Senior Orthopaedic doctor was also provided in the medical camp.
            </p>
            <div className="news-item__gallery">
              {["camp-1", "camp-2", "camp-3", "camp-4"].map((name) => (
                <a
                  className="gallery__item"
                  key={name}
                  href={`/images/${name}.jpg`}
                  data-lightbox=""
                  data-caption="Free Medical Camp in Regadichilaka Village"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${name}.jpg`}
                    alt="Free Medical Camp in Regadichilaka Village"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </article>

          {/* ---------- 3 ---------- */}
          <article className="news-item" data-reveal="">
            <span className="news-item__date">20.09.2024</span>
            <h3>New Development Commissioner Joins IKSEZ- 20.09.2024</h3>
            <p>
              Mr.Hrushikesh Reddy joins as Development Commissioner, IKSEZ on 20-09-2024. He was
              welcomed by CEO along with Specified officer and A.O/P.O. He also visited the ADJ
              unit.
            </p>
            <div className="news-item__gallery">
              {["new-1", "new-2", "new-3", "new-4"].map((name) => (
                <a
                  className="gallery__item"
                  key={name}
                  href={`/images/${name}.jpg`}
                  data-lightbox=""
                  data-caption="New Development Commissioner Joins IKSEZ"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${name}.jpg`}
                    alt="New Development Commissioner Joins IKSEZ"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </article>

          {/* ---------- 4 ---------- */}
          <article className="news-item" data-reveal="">
            <span className="news-item__date">27.08.2024</span>
            <h3>District Collector&apos;s Visit to IKSEZ- 27.08.2024</h3>
            <p>
              The District Collector of Nellore Mr.O.Anand had visited IKSEZ office on 27.08.2024.
              He was accompanied by the Revenue authorities along with APIIC and DIC officials.
            </p>
            <div className="news-item__gallery">
              {["district-1", "district-2", "district-3"].map((name) => (
                <a
                  className="gallery__item"
                  key={name}
                  href={`/images/${name}.jpg`}
                  data-lightbox=""
                  data-caption="District Collector's Visit to IKSEZ"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${name}.jpg`}
                    alt="District Collector's Visit to IKSEZ"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </article>

          {/* ---------- 5 ---------- */}
          <article className="news-item" data-reveal="">
            <h3>IKSEZ celebrates 150 th Birth Anniversary of the Father of the Nation</h3>
            <p>
              IFFCO Kisan SEZ celebrated the 150 th Birth Anniversary of the Father of Nation,
              Mahatma Gandhi. The following activities were undertaken.
            </p>
            <ul className="check-list">
              <li>
                Free medical and veterinary camps were organised in Racharlapadu and Regadichilaka
                villages. About 450 villagers availed the services.
              </li>
              <li>New Buffalo cage for tying cattle in Racharlapadu village installed as per villager&rsquo;s request.</li>
              <li>
                &lsquo;My Experiments with Truth&rsquo; &ndash; celebrated auto-biography of
                Mahatma were distributed to children in schools from adjoining villages and
                conducted a written quiz.
              </li>
              <li>
                Arranged a &lsquo;Workshop on Lemon&rsquo; for the benefit of Lemon farmers in
                association with IFFCO Kisan Sanchar Limited.
              </li>
              <li>Basic tailoring course for women from adjoining villages through ITI (Girls), Nellore.</li>
            </ul>

            <div className="news-item__gallery">
              {[
                { name: "Layer 1", caption: "Free medical and veterinary camps organised in Racharlapadu and Regadichilaka villages" },
                { name: "Layer 2", caption: "Free medical and veterinary camps organised in Racharlapadu and Regadichilaka villages" },
                { name: "Layer 3", caption: "Basic tailoring course for empowerment of women" },
                { name: "Layer 4", caption: "School children participating in written quiz on Mahatma Gandhi" },
                { name: "Layer 5", caption: "Seminar on Lemon Crop at Podalakur" },
                { name: "Layer 6", caption: "Technical Session in Seminar" },
                { name: "Layer 7", caption: "Question and Answer session by experts" },
                { name: "Layer 8", caption: "Keen interest to get solutions" },
              ].map(({ name, caption }) => (
                <a
                  className="gallery__item"
                  key={name}
                  href={`/images/${encodeURIComponent(name)}.png`}
                  data-lightbox=""
                  data-caption={caption}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/${encodeURIComponent(name)}.png`} alt={caption} loading="lazy" />
                  <span className="gallery__cap">{caption}</span>
                </a>
              ))}
            </div>
          </article>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
