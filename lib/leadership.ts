export interface LeadershipProfile {
  name: string;
  role: string;
  organization?: string;
  image: string;
  bio: string;
  /** Profile URL on X; shows a "Follow on X" link on the leadership banner. */
  twitter?: string;
  /** Locale-neutral path of this leader's own profile page, if the site has one. */
  profilePath?: string;
}

export const chairman: LeadershipProfile = {
  name: "Mr. Dileep Sanghani",
  role: "Chairman",
  image: "/images/leadership/iffco/Mr.-Dileep-Sanghani_desktop.jpg",
  bio: "Mr. Dileep Sanghani is the Chairman of IFFCO. He is an eminent cooperator who has been deeply involved in providing strength to the Indian cooperative movement since the last three decades. Mr Sanghani is currently holding key positions in various top national and state level cooperative organisations like NAFED, NCUI and GUJCOMASOL. Mr. Sanghani has represented Amreli constituency four times in the Lok Sabha from 1991-2004. He has also served as an MLA from Amreli and has headed various key ministries like Agriculture, Cooperation, Animal Husbandry, etc in Gujarat. Mr. Sanghani has been instrumental in formulating farmer oriented policies of IFFCO.",
  twitter: "https://x.com/Dileep_Sanghani",
  profilePath: "/board-of-directors/dileep-sanghani/",
};

export const managingDirector: LeadershipProfile = {
  name: "Mr. K. J. Patel",
  role: "Managing Director",
  image: "/images/leadership/iffco/mr-k-j-patel.jpg",
  bio: "Mr. K. J. Patel is a highly accomplished mechanical engineer with over three decades of specialized experience in the maintenance and operation of Nitrogenous and Phosphatic fertiliser plants. An engineering graduate from Saurashtra University, Gujarat, he assumed charge as Managing Director of IFFCO on 1st August 2025. He began his career at IFFCO’s Kalol Unit, where he served in various technical and leadership roles for 23 years. In 2012, he moved to the Paradeep Unit and was later elevated as Unit Head in March 2019. His tenure has been marked by significant improvements in plant reliability, efficiency, and technology adoption.",
  twitter: "https://x.com/KiritkrJPatel",
  profilePath: "/board-of-directors/k-j-patel/",
};

export const directors: LeadershipProfile[] = [
  {
    name: "Mr. Ramesh Kumar",
    role: "Director - HR & Legal",
    image: "/images/leadership/iffco/Mr.Ramesh_0.png",
    bio: "Mr. Kumar leads human resources and legal functions with extensive experience in industrial relations and people-centric systems.",
  },
];
