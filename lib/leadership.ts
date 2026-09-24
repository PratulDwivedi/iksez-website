export interface LeadershipProfile {
  name: string;
  role: string;
  organization?: string;
  image: string;
  bio: string;
}

export const chairman: LeadershipProfile = {
  name: "Mr. Dileep Sanghani",
  role: "Chairman",
  image: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2026-05/Mr.-Dileep-Sanghani_desktop.jpg",
  bio: "Mr. Dileep Sanghani is an eminent cooperator who has been deeply involved in strengthening the Indian cooperative movement for more than three decades. He has held key positions in national and state-level cooperative organisations including NAFED, NCUI and GUJCOMASOL, and has contributed to farmer-oriented policies of IFFCO.",
};

export const managingDirector: LeadershipProfile = {
  name: "Mr. K. J. Patel",
  role: "Managing Director",
  image: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2025-10/mr-k-j-patel.png",
  bio: "Mr. K. J. Patel is a mechanical engineer with more than three decades of experience in the maintenance and operation of nitrogenous and phosphatic fertiliser plants. He assumed charge as Managing Director of IFFCO on 1 August 2025 after serving in technical and leadership roles at the Kalol and Paradeep units.",
};

export const directors: LeadershipProfile[] = [
  {
    name: "Mr. Ramesh Kumar",
    role: "Director - HR & Legal",
    image: "https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2026-02/Mr.Ramesh_0.png",
    bio: "Mr. Kumar leads human resources and legal functions with extensive experience in industrial relations and people-centric systems.",
  },
];
