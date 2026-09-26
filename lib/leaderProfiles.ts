import type { GalleryTab } from "@/components/LeaderGallery";

// Content for the leadership profile pages under /board-of-directors/.
// Each mirrors that leader's profile on iffco.in (linked per entry); photos
// are local copies of IFFCO's, in public/images/leadership/iffco. Rendered by
// LeaderProfilePage.

const ASSETS = "/images/leadership/iffco";
const asset = (file: string) => `${ASSETS}/${file}`;

export const LEADER_LEAF = asset("yellow-leaf-small_1.svg");

export type LeaderFeature =
  // Large photo overlapping a green box that holds the text and a small photo.
  | { layout: "overlap"; title: string; text: string; image: string; smallImage: string }
  // Green text box on the left, photo on the right.
  | { layout: "split"; title: string; text: string; image: string };

export interface LeaderProfileContent {
  /** Page <title> and meta description. */
  metaTitle: string;
  metaDescription: string;
  hero: { title: string; intro: string; name: string; image: string };
  /** Grey band of alternating photo / green text rows. */
  highlights: { heading: string; rows: { image: string; title?: string; lines: string[] }[] };
  features: LeaderFeature[];
  gallery: GalleryTab[];
  social: {
    handle: string;
    displayName: string;
    /** Copies of the X profile banner and avatar, in public/images/leadership. */
    banner: string;
    avatar: string;
    /** Recent posts shown as cards. X no longer renders embedded profile
     *  timelines, so these are picked by hand: replace the IDs (the number at
     *  the end of a post's URL) to show newer posts. */
    postIds: string[];
    /** An Elfsight "X (Twitter) Feed" widget ID (the part after
     *  "elfsight-app-" in its embed code). When set, it replaces the built-in
     *  card with that self-updating feed, as iffco.in does. */
    elfsightWidgetId?: string;
  };
}

// https://www.iffco.in/en/dileep-sanghani
export const dileepSanghaniProfile: LeaderProfileContent = {
  metaTitle: "Mr. Dileep Sanghani, Chairman | IFFCO Kisan SEZ",
  metaDescription:
    "Mr. Dileep Sanghani, Chairman of IFFCO — cooperative leader, parliamentarian and policymaker championing farmer prosperity.",
  hero: {
    title: "Pioneering Indian Fertiliser Industry",
    intro:
      "Shri Dileep Sanghani is a distinguished leader and cooperative champion, currently serving as the Chairman of IFFCO, the world’s largest cooperative in fertilisers. A seasoned parliamentarian and visionary policymaker, he brings decades of experience in public service, agriculture, and rural development. His leadership is rooted in inclusivity, farmer prosperity, and strengthening India’s cooperative ecosystem.",
    name: "Mr. Dileep Sanghani",
    image: asset("Mr-dileep-sanghani_0.png"),
  },
  highlights: {
    heading: "The Torchbearer of Change",
    rows: [
      {
        image: asset("PM-IFFCO_New_0.jpeg"),
        lines: [
          "A committed advocate for farmers and rural communities, Mr. Sanghani has consistently worked to expand access to credit, technology, and market opportunities. His tenure in public life has been marked by a focus on sustainable agriculture, rural empowerment, and cooperative growth that bridges tradition with innovation.",
        ],
      },
      {
        image: asset("IFFCO-IMG-4-1_0.jpg"),
        lines: [
          "During his distinguished career, he has held important roles at state and national levels, including multiple terms as Member of Parliament from Amreli, Gujarat, and several ministerial portfolios in the Gujarat Government. His deep understanding of grassroots issues continues to guide his efforts in strengthening cooperative structures nationwide.",
        ],
      },
      {
        image: asset("Dileep-Sanghani-PM_0.jpeg"),
        lines: [
          "As Chairman of IFFCO, Mr. Sanghani is driving efforts to expand the cooperative’s global presence, enhance farmer services, and promote collaborations across borders. Under his stewardship, IFFCO is advancing initiatives that support sustainable agricultural practices and create value for farming communities across India and beyond.",
        ],
      },
    ],
  },
  features: [
    {
      layout: "overlap",
      title: "Putting IFFCO on the Global Map",
      text: "Shri Dileep Sanghani’s leadership reflects IFFCO’s ambition to expand its global footprint while staying rooted in cooperative values. His focus on strategic collaborations, modern agricultural solutions, and farmer-first initiatives is helping IFFCO build stronger international linkages and future-ready capabilities.",
      image: asset("1st.jpeg"),
      smallImage: asset("2nd.jpeg"),
    },
    {
      layout: "split",
      title: "A People’s Leader",
      text: "Shri Dileep Sanghani is widely respected for his people-centric leadership and long-standing commitment to the cooperative movement. With decades of experience in public service, he believes in empowering farmers through stronger institutions, transparent governance, and modern solutions that improve livelihoods at the grassroots.",
      image: asset("ch-img1.jpg"),
    },
  ],
  gallery: [
    {
      label: "Transformation In Action",
      images: ["MM4.jpeg", "man-in-act.jpeg", "ch-img4.jpg", "ch-img3-1.jpg"].map(asset),
    },
    {
      label: "People's Chairman",
      images: [
        "One.jpeg",
        "One-2_0.png",
        "One-3_0.jpeg",
        "peoples-chairman4.jpg",
        "peoples-chairman2_5.jpg",
        "peoples-chairman3_6.jpg",
        "peoples-chairman4_7.jpg",
        "With-PPL1-8.jpeg",
        "WP2-9.jpeg",
        "WP3-10.jpeg",
        "WP4-11.jpeg",
        "peoples-chairman5_12.jpg",
      ].map(asset),
    },
    {
      label: "Memorable Moments",
      images: ["M2.jpeg", "M5.jpeg", "memorable2.png", "memorable1.jpg", "memory-2.jpg", "M11.jpeg", "people-with-leader_0.jpeg"].map(
        asset,
      ),
    },
  ],
  social: {
    handle: "Dileep_Sanghani",
    displayName: "DILEEP SANGHANI",
    banner: "/images/leadership/dileep-sanghani-x-banner.jpg",
    avatar: "/images/leadership/dileep-sanghani-x-avatar.jpg",
    postIds: ["2103091853033718019", "2102748762255048800", "2102613209765364179"],
  },
};

// https://www.iffco.in/en/k-j-patel
export const kjPatelProfile: LeaderProfileContent = {
  metaTitle: "Mr. K. J. Patel, Managing Director | IFFCO Kisan SEZ",
  metaDescription:
    "Mr. K. J. Patel, Managing Director of IFFCO — a mechanical engineer with four decades in fertiliser operations, plant reliability and strategic leadership.",
  hero: {
    // Trailing dots as on iffco.in.
    title: "Indian Farmers Fertiliser Cooperative Ltd. (IFFCO)....",
    intro:
      "Mr. K. J. Patel is a highly accomplished mechanical engineer with over three decades of specialized experience in the maintenance and operation of Nitrogenous and Phosphatic fertiliser plants. An engineering graduate from Saurashtra University, Gujarat, he assumed charge as Managing Director of IFFCO on 1st August 2025.",
    name: "Shri K. J. Patel",
    image: asset("k-j-patel_1.png"),
  },
  highlights: {
    heading: "Engineering Precision. Strategic Vision. Transformative Leadership.",
    rows: [
      {
        image: asset("k-J-patel.jpg"),
        lines: [
          "A career technocrat who rose through IFFCO’s ranks over four decades.",
          "From a Graduate Engineer Trainee to Managing Director — built on performance, discipline, and results.",
          "An incisive mind with sharp operational judgment and strong business acumen.",
        ],
      },
      {
        image: asset("IFFCO-IMG-3.jpg"),
        title: "Performance-Driven Leadership",
        lines: [
          "40 years of hands-on excellence in fertiliser operations and plant reliability.",
          "Led complex manufacturing units with data-backed decisions and execution focus.",
          "Standardized systems across IFFCO to deliver measurable gains in efficiency and uptime.",
        ],
      },
      {
        image: asset("IFFCO-IMG-1.jpg"),
        title: "Global Perspective. Cooperative Core.",
        lines: [
          "Board-level engagement across international joint ventures and strategic institutions.",
          "Strengthens partnerships with a pragmatic, value-driven approach.",
          "Focused on sustainable growth, global competitiveness, and farmer prosperity.",
        ],
      },
    ],
  },
  features: [
    {
      layout: "overlap",
      title: "Instigating professionalism & transparency",
      text: "Revived and repositioned Paradeep as a high-performing, resilient unit. Institutionalized risk-based maintenance, cost optimization, and safety rigor. Delivered stability during extreme natural disruptions — without compromising output.",
      image: asset("Instigating-professionalism-transparency-text-matter.jpg"),
      smallImage: asset("inner-pic1.jpg"),
    },
    {
      layout: "split",
      title: "Technical Depth. Business Foresight.",
      text: "Expert in maintenance strategy, inspection systems, and large-scale plant operations. Combines engineering precision with strategic clarity. Drives modernization while safeguarding operational fundamentals.",
      image: asset("Technical-depth-business-foresight-jpg.jpg"),
    },
    {
      layout: "overlap",
      title: "Diversification of Business",
      text: "Mr. Patel is steering IFFCO towards a future defined by innovation, global partnerships and strategic diversification. By strengthening backward integration and exploring overseas joint ventures, he aims to secure key resources and build resilient supply chains for India’s agriculture. His leadership is also accelerating the adoption of cutting-edge solutions such as nano fertilisers and other sustainable agri-inputs developed by IFFCO. The vision is to transform IFFCO into a global agri-solutions leader while empowering farmers with smarter, more efficient technologies.",
      image: asset("ex-inner-pic1.jpg"),
      smallImage: asset("Technical-depth-business-foresight-small-pic.jpg"),
    },
  ],
  gallery: [
    {
      label: "Leadership In Action",
      images: ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg", "img6.jpg", "img7.jpg"].map(asset),
    },
  ],
  social: {
    handle: "KiritkrJPatel",
    displayName: "Kiritkumar J Patel",
    banner: "/images/leadership/k-j-patel-x-banner.jpg",
    avatar: "/images/leadership/k-j-patel-x-avatar.jpg",
    postIds: ["2102766802707382379", "2102744743260332040", "2102085589155852534"],
  },
};
