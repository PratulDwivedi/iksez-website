// Data shape + fetch boundary for the Agri Dashboard (app/admin/(protected)/agri/dashboard).
// The Agri Business module (public.agri_farmers, agri_crops, agri_crop_seasons,
// agri_queries, agri_sell_slots, ... — see the "Agri Business" nav group in
// lib/adminMenu.json) has no backing tables yet, so getAgriDashboardSummary()
// below returns realistic dummy data instead of calling a Supabase RPC.
//
// It's still written as an async function returning this exact shape (not a
// plain constant) on purpose: once the schema + a fn_get_agri_dashboard_summary
// RPC exist, swapping this function's body for something like
//
//   const supabase = await createClient();
//   const { data } = await callRpc<AgriDashboardSummary[]>(supabase, 'fn_get_agri_dashboard_summary', {});
//   return data![0];
//
// (see lib/supabase/server.ts + lib/supabase/rpc.ts, and
// app/admin/(protected)/dashboard/page.tsx for the pattern this mirrors) is a
// one-function change — the page component and every child component below
// it don't need to change at all, since they only ever see this type.

export interface AgriCropDistribution {
  crop: string;
  acres: number;
}

export interface AgriCropSeason {
  name: string;
  status: 'planning' | 'active' | 'closed';
  progress: number; // 0-100
}

export interface AgriCalendarEvent {
  crop: string;
  activity: string;
  date: string; // ISO date
}

export interface AgriQuery {
  id: number;
  farmer_name: string;
  crop: string;
  subject: string;
  status: 'open' | 'answered' | 'closed';
  created_at: string; // ISO date
}

export interface AgriSellSlot {
  id: number;
  crop: string;
  location: string;
  date: string; // ISO date
  capacity: number;
  booked: number;
}

export interface AgriDashboardSummary {
  total_farmers: number;
  new_farmers_this_month: number;
  total_land_acres: number;
  open_queries: number;
  active_sell_slots: number;
  published_factsheets: number;
  crop_distribution: AgriCropDistribution[];
  crop_seasons: AgriCropSeason[];
  upcoming_calendar: AgriCalendarEvent[];
  recent_queries: AgriQuery[];
  upcoming_sell_slots: AgriSellSlot[];
}

const DUMMY_SUMMARY: AgriDashboardSummary = {
  total_farmers: 1248,
  new_farmers_this_month: 36,
  total_land_acres: 3420,
  open_queries: 18,
  active_sell_slots: 7,
  published_factsheets: 24,

  crop_distribution: [
    { crop: 'Wheat', acres: 1240 },
    { crop: 'Mustard', acres: 640 },
    { crop: 'Sugarcane', acres: 580 },
    { crop: 'Paddy', acres: 420 },
    { crop: 'Potato', acres: 310 },
    { crop: 'Gram', acres: 230 },
  ],

  crop_seasons: [
    { name: 'Rabi 2026', status: 'active', progress: 62 },
    { name: 'Zaid 2026', status: 'planning', progress: 8 },
    { name: 'Kharif 2025', status: 'closed', progress: 100 },
  ],

  upcoming_calendar: [
    { crop: 'Wheat', activity: 'Second irrigation', date: '2026-08-22' },
    { crop: 'Mustard', activity: 'Sowing window closes', date: '2026-08-25' },
    { crop: 'Sugarcane', activity: 'Fertilizer application', date: '2026-08-28' },
    { crop: 'Potato', activity: 'Land preparation', date: '2026-09-02' },
    { crop: 'Paddy', activity: 'Harvesting', date: '2026-09-10' },
  ],

  recent_queries: [
    {
      id: 1,
      farmer_name: 'Ram Singh',
      crop: 'Wheat',
      subject: 'Yellowing of leaves after second irrigation',
      status: 'open',
      created_at: '2026-08-17',
    },
    {
      id: 2,
      farmer_name: 'Sunita Devi',
      crop: 'Mustard',
      subject: 'Best time for second spray',
      status: 'answered',
      created_at: '2026-08-16',
    },
    {
      id: 3,
      farmer_name: 'Mahesh Yadav',
      crop: 'Sugarcane',
      subject: 'Pest attack on lower stalks',
      status: 'open',
      created_at: '2026-08-15',
    },
    {
      id: 4,
      farmer_name: 'Iqbal Khan',
      crop: 'Potato',
      subject: 'Seed variety recommendation',
      status: 'answered',
      created_at: '2026-08-14',
    },
  ],

  upcoming_sell_slots: [
    { id: 1, crop: 'Wheat', location: 'Mandi Slot A', date: '2026-08-24', capacity: 50, booked: 40 },
    { id: 2, crop: 'Mustard', location: 'Mandi Slot B', date: '2026-08-26', capacity: 30, booked: 22 },
    { id: 3, crop: 'Sugarcane', location: 'Mill Gate Slot', date: '2026-08-29', capacity: 40, booked: 15 },
  ],
};

export async function getAgriDashboardSummary(): Promise<AgriDashboardSummary> {
  return DUMMY_SUMMARY;
}
