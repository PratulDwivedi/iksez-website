import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Image Gallery | IFFCO Kisan SEZ",
  description:
    "Image gallery of IFFCO Kisan SEZ — project office, water pipelines, receiving yard, unit inaugurations and community events.",
};

// Full-size file, thumbnail file and caption — carried over verbatim from the
// original admin/upload gallery. A few captions reference files that were
// already missing from admin/upload on the original site (thumbLayer 2.png,
// medical-3.jpg, district-2.jpg, camp-4.jpg full-size originals); preserved
// as-is rather than "fixed", per the no-content-changes migration brief.
const PHOTOS: { full: string; thumb: string; caption: string }[] = [
  { full: "1485258222.jpg", thumb: "thumb1485258222.jpg", caption: "Purnakumbha Swagatham given to the Hon'ble Board of Directors on 03.01.17" },
  { full: "1455014943.jpg", thumb: "thumb1455014943.jpg", caption: "Project office building" },
  { full: "1455859198.JPG", thumb: "thumb1455859198.JPG", caption: "Canteen in the project office building" },
  { full: "1383115817.jpg", thumb: "thumb1383115817.jpg", caption: "33 KV receiving yard at project site" },
  { full: "1427175678.jpg", thumb: "thumb1427175678.jpg", caption: "Jack well at Kanigiri Reservoir" },
  { full: "1383115769.jpg", thumb: "thumb1383115769.jpg", caption: "Laying of water pipelines from Kanigiri Reservoir to project site completed." },
  { full: "1383115595.jpg", thumb: "thumb1383115595.jpg", caption: "Sluice valves installed in the water pipelines" },
  { full: "1383115683.jpg", thumb: "thumb1383115683.jpg", caption: "Weigh Bridge Commissioned at the site" },
  { full: "1508909836.jpg", thumb: "thumb1508909836.jpg", caption: "CM Inauguration of Gamesh Unit on 3rd Feb, 2017" },
  { full: "1508909709.jpg", thumb: "thumb1508909709.jpg", caption: "Aerial View" },
  { full: "1508910209.jpg", thumb: "thumb1508910209.jpg", caption: "Desptach of first blade from Gamesa" },
  { full: "1508910440.jpg", thumb: "thumb1508910440.jpg", caption: "Aerial View" },
  { full: "1508910661.jpg", thumb: "thumb1508910661.jpg", caption: "Board of Directors on IFFCO Golden Jubilee Celebrations" },
  { full: "1508910982.jpg", thumb: "thumb1508910982.jpg", caption: "Office Building" },
  { full: "medical-3.jpg", thumb: "thumbmedical-3.jpg", caption: "Free Medical Camp in Racharlapadu Village" },
  { full: "Layer%202.png", thumb: "thumbLayer%202.png", caption: "Free Medical Camp in Regadichilaka Village" },
  { full: "district-2.jpg", thumb: "thumbdistrict-2.jpg", caption: "District Collector's Visit to IKSEZ" },
  { full: "camp-4.jpg", thumb: "thumbcamp-4.jpg", caption: "IKSEZ celebrates 150 th Birth Anniversary of the Father of the Nation" },
  { full: "1508911269.jpg", thumb: "thumb1508911269.jpg", caption: "Water gushing out from the scour valves during commissioning of the Pumps on 17.03.16." },
  { full: "1467963399.jpg", thumb: "thumb1467963399.jpg", caption: "Managing Director inaugurated Weigh Bridge on 29.06.16" },
  { full: "1508912042.jpg", thumb: "thumb1508912042.jpg", caption: "Managing Director inaugurated Water Pipeline on 30.06.16" },
  { full: "1508909973.jpg", thumb: "thumb1508909973.jpg", caption: "On the eve of IFFCO Golden Jubilee celebrations Havan was performed at IKSEZ office on 03-11-2016." },
  { full: "1383127083.jpg", thumb: "thumb1383127083.jpg", caption: "Demo Polyhouses" },
  { full: "1435654270.jpg", thumb: "thumb1435654270.jpg", caption: "Puja in the Project Office building" },
  { full: "1485258321.jpg", thumb: "thumb1485258321.jpg", caption: "IFFCO Golden Jubilee plaques inaugurated on 03.01.2017" },
];

export default function Gallery() {
  return (
    <>
      <PageHero title="Media" subtitle="Image Gallery" banner="/images/media-banner.png" />

      <section className="section section--tight">
        <div className="container">
          <div className="chip-row" data-reveal="">
            <Link className="btn btn--outline btn--sm" href="/news-and-events/">
              News and Events
            </Link>
            <Link className="btn btn--brand btn--sm" href="/gallery/">
              Image Gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="gallery" data-reveal="">
            {PHOTOS.map((p, i) => (
              <a
                className="gallery__item"
                key={`${p.full}-${i}`}
                href={`/admin/upload/${p.full}`}
                data-lightbox=""
                data-caption={p.caption}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/admin/upload/${p.thumb}`} alt={p.caption} loading="lazy" />
                <span className="gallery__cap">{p.caption}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
