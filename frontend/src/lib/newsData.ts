export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
  email: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url?: string;
  category_id: string;
  author_id: string;
  is_featured: boolean;
  is_breaking: boolean;
  views: number;
  published_at: string;
  categories?: Category;
  authors?: Author;
  author_name?: string;
  author_logo?: string;
}

// Categories - Commented out to start fresh with admin-created content
/*
export const categories: Category[] = [
  { id: '1', name: 'Local', slug: 'local', description: 'Local news from Coimbatore' },
  { id: '2', name: 'Business', slug: 'business', description: 'Business and economic news' },
  { id: '3', name: 'Education', slug: 'education', description: 'Education and school news' },
  { id: '4', name: 'Sports', slug: 'sports', description: 'Sports and athletic events' },
  { id: '5', name: 'Real Estate', slug: 'real-estate', description: 'Real estate and property news' },
  { id: '6', name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle and entertainment news' },
  { id: '7', name: 'Events', slug: 'events', description: 'Community events and celebrations' },
  { id: '8', name: 'Transport', slug: 'transport', description: 'Transportation and infrastructure news' }
];
*/
export const categories: Category[] = [];

// Authors - Commented out to start fresh with admin-created content
/*
export const authors: Author[] = [
  { id: '1', name: 'Coimbatore Express Staff', bio: 'Our dedicated team of local journalists', avatar_url: '', email: 'news@coimbatoreexpress.com' },
  { id: '2', name: 'Sports Correspondent', bio: 'Covering local sports and athletic events', avatar_url: '', email: 'sports@coimbatoreexpress.com' },
  { id: '3', name: 'Business Reporter', bio: 'Reporting on local business and economic developments', avatar_url: '', email: 'business@coimbatoreexpress.com' }
];
*/
export const authors: Author[] = [];

// News Articles - Commented out to start fresh with admin-created content
/*
export const articles: Article[] = [
  {
    id: '1',
    title: 'Special Pradosham Pooja Held at Dharmalingeswarar Temple',
    slug: 'special-pradosham-pooja-dharmalingeswarar-temple',
    excerpt: 'The renowned Dharmalingeswarar Temple, located on the hill at Mathukkarai in Coimbatore, witnessed special prayers on the occasion of Pradosham on Monday.',
    content: 'Coimbatore:\nThe renowned Dharmalingeswarar Temple, located on the hill at Mathukkarai in Coimbatore, witnessed special prayers on the occasion of Pradosham on Monday.\n\nSpecial abhishekam and poojas were performed for Lord Dharmalingeswarar and Nandi. Following the rituals, the deity was adorned with special decorations and offered deepa aradhana. Devotees had darshan of the Lord in all his splendour as he bestowed blessings in an ornate attire.\n\nA large number of devotees participated in the event and offered their prayers. The temple committee had made elaborate arrangements for the smooth conduct of the rituals and to facilitate the devotees visit.',
    featured_image_url: '/news (1).jpeg',
    category_id: '7',
    author_id: '1',
    is_featured: true,
    is_breaking: false,
    views: 1250,
    published_at: '2025-11-07T10:00:00Z'
  },
  {
    id: '2',
    title: 'Coimbatore Vizha to be held from November 14 to 24',
    slug: 'coimbatore-vizha-november-14-24',
    excerpt: 'The 18th edition of Coimbatore Vizha will take place from November 14 to 24, organized by the Young Indians (Yi) Coimbatore chapter.',
    content: 'Coimbatore:\nThe 18th edition of Coimbatore Vizha will take place from November 14 to 24, organized by the Young Indians (Yi) Coimbatore chapter. The festival will be officially launched on the evening of October 31 at Brookefields Mall.Over 100 events are planned across 11 days, featuring the marquee Sky Dance projection mapping experience held each evening at CODISSIA Trade Fair Complex. This years Vizha emphasizes inclusivity, with business pitches by transgender entrepreneurs and para sports events for children with autism.Events are spread across multiple neighborhoods to engage residents directly. Highlights include the Isai Mazhai music program at six venues, clean-up drives at five locations, cultural showcases at 11 sites, and the Art Street festival on Scheme Road on November 22 and 23, along with musical performances on East TV Swamy Road.The festival aims to celebrate the spirit and diversity of Coimbatore through culture, community, and creativity.',
    featured_image_url: '/news (2).jpeg',
    category_id: '7',
    author_id: '1',
    is_featured: true,
    is_breaking: false,
    views: 2100,
    published_at: '2025-11-07T09:00:00Z'
  },
  {
    id: '3',
    title: 'Coimbatore airport records 11% rise in passenger traffic',
    slug: 'coimbatore-airport-passenger-traffic-increase',
    excerpt: 'The Coimbatore International Airport has registered an 11 percent growth in passenger traffic, handling 17.6 lakh flyers between April and September this financial year.',
    content: 'Coimbatore:\nThe Coimbatore International Airport has registered an 11 percent growth in passenger traffic, handling 17.6 lakh flyers between April and September this financial year, according to data from the Airports Authority of India (AAI).The airport had recorded over 30 lakh passengers in 2024, despite being designed for an annual capacity of 20 lakh. It now handles more than 30 departures a day, including domestic flights to major cities such as Chennai, Hyderabad, Mumbai, Delhi, Bengaluru, Pune, Goa, and Ahmedabad, and international services to Singapore, Abu Dhabi, and Sharjah.The Kongu Global Forum (KGF), a consortium of business and industrial leaders from Tamil Nadus western districts, urged the authorities to draw up an interim plan to enhance the airports handling capacity. It also sought additional flights on busy domestic routes and new international services to Colombo, Bangkok, Dubai, and Doha.Airport Director G. Sambath Kumar said that construction of a compound wall around the land recently transferred by the State government to the AAI is progressing and expected to be completed by September 2026. The wall will have a total length of about 16 kilometres.',
    featured_image_url: '/news (3).jpeg',
    category_id: '8',
    author_id: '1',
    is_featured: false,
    is_breaking: true,
    views: 1850,
    published_at: '2025-11-07T08:30:00Z'
  },
  {
    id: '4',
    title: 'Coimbatore Police to Install 1,400 CCTV Cameras, Step Up Night Patrolling',
    slug: 'coimbatore-police-cctv-cameras-night-patrolling',
    excerpt: 'In a bid to strengthen security and curb crime, the Coimbatore City Police will install 1,400 new surveillance cameras across the city.',
    content: 'Coimbatore, \n In a bid to strengthen security and curb crime, the Coimbatore City Police will install 1,400 new surveillance cameras across the city. Police Commissioner A. Saravana Sundar announced the initiative on Monday, stating that the move forms part of measures to enhance public safety and improve visible policing.\n\nThe cameras will be installed in vulnerable and isolated areas, particularly around vacant lands, entry and exit points, and crime-prone localities. The decision follows the recent abduction and gang-rape of a 20-year-old college student near Brindhavan Nagar, close to the city airport.\n\nAt present, the city has 700 police-installed CCTV cameras. The Commissioner noted that numerous cameras set up by private residents and business establishments were found to be non-functional. He urged the public to ensure that their surveillance systems remain active and properly maintained.\n\nRegular patrolling has contributed to a decline in assault-related cases this year. We will further intensify police presence in all parts of the city, Mr. Sundar said.\n\nPolice personnel had patrolled Brindhavan Nagar on the day of the crime, according to officials. However, the offence occurred in a deserted plot along a mud road connecting Brindhavan Nagar and SIHS Colony.\n\nCoimbatore currently operates 59 two-wheeler beat patrol units and 25 GPS-enabled patrol vehicles. The Peelamedu police, under whose jurisdiction the incident took place, have five beat units and two patrol cars.\n\nInstructions have been issued to step up night patrolling along the Brindhavan Nagar–SIHS Colony stretch and similar isolated routes.\n\nAuthorities said the expanded camera network and intensified patrolling efforts aim to provide enhanced safety to residents and deter criminal elements.',
    featured_image_url: '/news (4).jpeg',
    category_id: '1',
    author_id: '1',
    is_featured: false,
    is_breaking: true,
    views: 3200,
    published_at: '2025-11-07T08:00:00Z'
  },
  {
    id: '5',
    title: 'Railways clears Vande Bharat service between Bengaluru and Ernakulam via Coimbatore',
    slug: 'vande-bharat-bengaluru-ernakulam-via-coimbatore',
    excerpt: 'The Ministry of Railways has cleared the introduction of a new Vande Bharat Express between KSR Bengaluru and Ernakulam, passing through Coimbatore.',
    content: ' Coimbatore:\nThe Ministry of Railways has cleared the introduction of a new Vande Bharat Express between KSR Bengaluru and Ernakulam, passing through Coimbatore. The train will operate six days a week, except on Wednesdays.According to the Railway Boards communication issued recently, Train No. 26651 KSR Bengaluru–Ernakulam Vande Bharat Express will depart Bengaluru at 5.10 a.m. and reach Ernakulam at 1.50 p.m. The return service, Train No. 26652, will leave Ernakulam at 2.20 p.m. and arrive in Bengaluru at 11 p.m.The train will halt at Krishnarajapuram, Salem, Erode, Tiruppur, Coimbatore, Palakkad, and Thrissur. During its southbound journey, it will pass Coimbatore at 10.35 a.m., Palakkad at 11.30 a.m., and Thrissur at 12.30 p.m. The same stations will be covered in reverse order while returning.The Railway Board has instructed South Western Railway and Southern Railway to commence services at an early, convenient date and to issue wide publicity. It has also permitted a special inaugural service before regular operations begin, if deemed necessary.The move has been welcomed by Coimbatore NXT, an initiative of the Confederation of Indian Industry (CII), Coimbatore, which said the train would enhance connectivity for both business and leisure travellers. The new Vande Bharat will cover the Coimbatore–Bengaluru route in five-and-a-half hours and the Coimbatore–Ernakulam stretch in about three hours, making it the fastest option available.The industry body also urged Southern Railway to cut the travel time of the existing Coimbatore–Bengaluru Vande Bharat to six hours and to introduce another service linking Coimbatore and Thiruvananthapuram via Ernakulam.During his recent visit to Coimbatore, Vice-President C.P. Radhakrishnan announced that a Vande Bharat train connecting Ernakulam and Bengaluru via Salem, Erode, Tiruppur, and Coimbatore, along with a daily train from Coimbatore to Ranchi, would be introduced shortly.',
    featured_image_url: '/news (5).jpeg',
    category_id: '8',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 2750,
    published_at: '2025-11-07T07:30:00Z'
  },
  {
    id: '6',
    title: 'Coimbatore Corporation\'s ₹200-crore plan to revive River Noyyal draws environmental concerns',
    slug: 'coimbatore-corporation-river-noyyal-revival-plan',
    excerpt: 'The Coimbatore City Municipal Corporation\'s ambitious ₹200-crore project to rejuvenate the Noyyal River has drawn criticism from environmentalists.',
    content: 'Coimbatore:\nThe Coimbatore City Municipal Corporation\'s ambitious ₹200-crore project to rejuvenate the Noyyal River has drawn criticism from environmentalists, who say the initiative focuses more on beautification than on tackling sewage and pollution at the source.The project covers an 18.5-km stretch of the river within city limits and includes desilting, strengthening of river bunds, construction of two sewage treatment plants (4 MLD each), and diversion channels linking drains to existing treatment facilities. Plans also include a 4.5-km riverfront road from Athupalam to Nanjundapuram Road, development of four parks, and other landscaping works.Environmental activists argue that while the beautification plans may boost the riverfront\'s aesthetics, they fail to address untreated sewage discharge, the primary cause of the river\'s degradation. Activist K. Mohanraj pointed out that with a population exceeding 22 lakh and average per capita water use of 135 litres a day, Coimbatore generates vast quantities of domestic wastewater. Expanding existing sewage treatment capacity and preventing untreated waste from entering the Noyyal should be the top priority, he said, adding that the proposed treatment capacity may not be sufficient for long-term needs.Another activist, K. Selvaganesh, cautioned against the use of exotic plants such as Conocarpus along bunds, noting that such species harm local biodiversity and provide little support for pollinators and migratory birds. Native species should be planted to restore ecological balance, he added.A senior Corporation official defended the project, stating that the beautification works would primarily use native vegetation and minimal concrete to stabilize the bunds. Exotic species, the official clarified, would be planted only in adjacent park areas. The official also said that sewage currently enters the Noyyal at 41 points, and the proposed treatment facilities would be adequate for the next decade. By then, the city is expected to achieve full coverage under the underground drainage system.The detailed project report for the Noyyal rejuvenation plan is expected to be completed within a week.',
    featured_image_url: '/news (6).jpeg',
    category_id: '1',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 1650,
    published_at: '2025-11-07T07:00:00Z'
  },
  {
    id: '7',
    title: 'Camford International School 16th anniversary and founder\'s day',
    slug: 'camford-international-school-16th-anniversary',
    excerpt: 'The 16th anniversary and founder\'s day celebrations of Camford International School were held with great enthusiasm.',
    content: 'Coimbatore, \nThe Camford International School is located in Maniyakarampalayam, Coimbatore. The 16th anniversary and founder\'s day celebrations of this school were held. The school\'s chairman Arul Ramesh and principal Poonkothai Arul Ramesh presided over the function. The school principal Poonam Sial welcomed the students by reading out the annual report of the school.\nM. Manickavasagam, Director of the Indian Defence Research and Development Organization and Director of SPIC, attended the function as the special guest. He expressed his appreciation for The Camford International School being recognized as the best school in India at the summit held in the UK Parliament.\nAt the function, certificates and medals were given to the students who scored the best marks in the 10th and 12th class examinations in the academic year 2024-25. During the function, the students of the school jointly performed various programs including music, dance, drama, etc. They impressed the audience.',
    featured_image_url: '/news (7).jpeg',
    category_id: '3',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 890,
    published_at: '2025-11-07T06:30:00Z'
  },
  {
    id: '8',
    title: 'KMCH receive Best Managed Institutions Award',
    slug: 'kmch-best-managed-institutions-award',
    excerpt: 'The Deloitte Institute has conferred the Best Managed Institutions Award on Coimbatore Hospital and Medical Centre (KMCH).',
    content: 'Coimbatore, \nThe Deloitte Institute has conferred the Best Managed Institutions Award on Coimbatore Hospital and Medical Centre (KMCH). It is worth mentioning that KMCH is the first Indian hospital to receive this honor. The award ceremony was held in Mumbai. KMCH. Executive Director Dr. Arun N. Palaniswami and CEO Sivakumaran Janakiraman received the award at the ceremony. Deloitte presents the awards by listing the institutions on the basis of factors including reliability, performance, visionary leadership, global quality management, strong financial management, and long-term planning. Commenting on the award, KMCH. Chairman and Managing Director Dr. Nalla G. Palaniswami said that this milestone achievement is a recognition of the dedication of every employee. It will motivate them to work even harder.',
    featured_image_url: '/news (8).jpeg',
    category_id: '2',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 1120,
    published_at: '2025-11-07T06:00:00Z'
  },
  {
    id: '9',
    title: 'Coimbatore Govt. Schools Set for Sports Excellence Upgrade',
    slug: 'coimbatore-govt-schools-sports-excellence',
    excerpt: 'Two government schools in the Coimbatore district are set to be transformed into Sports Schools of Excellence.',
    content: 'Coimbatore: \nTwo government schools in the Coimbatore district are set to be transformed into Sports Schools of Excellence, a move that aims to nurture young sporting talent and prepare students for global competition.\nThe development comes under a statewide initiative announced in 2023 by the School Education Department, which plans to establish two sports-focused schools in every district at a total investment of ₹9 crore per district.\nOfficials confirmed that the Seeranayakkanpalayam Government Higher Secondary School has been identified for the upgrade. In addition, one school from Thondamuthur, Ondipudhur, Mettupalayam, Sulur, Chinnathadagam, or Pollachi Municipality will be finalised shortly.\nAccording to district education authorities, schools were shortlisted based on the availability of land, suitability for sports infrastructure, and accessibility for students.\n We aim to provide students with an enabling environment and professional training facilities within their own district, an official said.\nThe upcoming facilities will feature volleyball and basketball courts, athletics tracks, and dedicated coaching staff. Training will be offered in morning and evening sessions, accompanied by nutrition-based meal support to enhance fitness and performance.\nThe initiative is expected to significantly improve the representation and achievements of government-school athletes at state, national, and international sporting arenas.',
    featured_image_url: '/news (9).jpeg',
    category_id: '3',
    author_id: '2',
    is_featured: false,
    is_breaking: false,
    views: 1340,
    published_at: '2025-11-07T05:30:00Z'
  },
  {
    id: '10',
    title: 'Coimbatore Corporation to Develop Sports Complex for Para-Athletes',
    slug: 'coimbatore-sports-complex-para-athletes',
    excerpt: 'The Coimbatore City Municipal Corporation is set to establish a dedicated sports complex for para-athletes.',
    content: 'Coimbatore:\nThe Coimbatore City Municipal Corporation is set to establish a dedicated sports complex for para-athletes, in a move aimed at strengthening inclusive sports infrastructure in the city. The project, planned on a 2.42-acre site along Jeeva Nagar Road in Ward 45, is estimated to cost ₹15 crore.\n\nCorporation officials said a detailed project plan, including architectural designs and accessibility provisions, was forwarded to the State government two months ago. The proposal underwent scrutiny and has since been returned with recommendations for modification.\n\nAccordingly, the civic body is revising the design to align with the State\'s directives, with particular focus on improving ramp configurations and accessibility elements. The changes are intended to ensure full compliance with national standards for facilities serving persons with disabilities.\n\nThe revised proposal will be resubmitted for approval soon. Once completed, the facility is expected to offer specialised training and competition spaces for para-athletes across various disciplines, reinforcing Coimbatore\'s commitment to inclusive sports development.',
    featured_image_url: '/news (10).jpeg',
    category_id: '4',
    author_id: '2',
    is_featured: false,
    is_breaking: false,
    views: 980,
    published_at: '2025-11-07T05:00:00Z'
  },
  {
    id: '11',
    title: 'Coimbatore: The Rising Powerhouse of South India\'s Real Estate Market',
    slug: 'coimbatore-rising-real-estate-powerhouse',
    excerpt: 'Coimbatore, long celebrated as the Manchester of South India, is now commanding fresh attention as one of the country\'s fastest-growing real estate destinations.',
    content: 'Coimbatore, long celebrated as the Manchester of South India, is now commanding fresh attention as one of the country\'s fastest-growing real estate destinations. What began as a textile-driven industrial town has evolved into a diversified economic hub, home to over 25,000 manufacturing, engineering, jewellery, poultry, and IT enterprises — a transformation that is now directly translating into soaring property values.\n\nThis growth story is powered by a rare blend of industrial strength, strategic infrastructure investments, and superior liveability. Remarkably, Coimbatore continues to rank among India\'s least-polluted urban centres, offering a quality of life unmatched in most fast-growing cities.\n\nA recent JLL study positions Coimbatore among India\'s top affordable investment markets — a compelling signal for value-seeking buyers and institutional investors alike. The impact is visible along emerging corridors and suburban belts, particularly near major highways, where land appreciation is accelerating.\n\nSmart City Vision Converts to Real-World Value:  As one of the first 20 cities chosen under India\'s Smart Cities Mission, Coimbatore has benefited from targeted upgrades across mobility, utilities, sustainability, and digital governance. These strategic investments have strengthened the city\'s reputation as a well-planned, future-ready urban centre — a key determinant for modern investors seeking long-term, stable growth markets.\n\nAirport Expansion: A Catalyst for Capital Flows:  A ₹2,000-crore expansion of Coimbatore International Airport represents a pivotal milestone in the city\'s growth trajectory. With 90% of land acquisition already complete, the expansion will unlock enhanced domestic and international connectivity, positioning Coimbatore for heightened investment inflows across sectors from global manufacturing to hospitality.\n\nReal estate activity around the airport corridor has already begun reflecting the shift, with rising demand and price appreciation.',
    featured_image_url: '/news (11).jpeg',
    category_id: '5',
    author_id: '3',
    is_featured: true,
    is_breaking: false,
    views: 4200,
    published_at: '2025-11-07T04:30:00Z'
  },
  {
    id: '12',
    title: 'Coimbatore Airport Expansion Gains Momentum with Master Plan and Key Tender',
    slug: 'coimbatore-airport-expansion-master-plan',
    excerpt: 'The long-awaited expansion of Coimbatore International Airport is inching closer to reality, signalling a major capacity upgrade.',
    content: 'Coimbatore:\nThe long-awaited expansion of Coimbatore International Airport is inching closer to reality, signalling a major capacity upgrade for one of Tamil Nadu\'s fastest-growing industrial hubs. The Airports Authority of India (AAI) has floated a tender for constructing a precast boundary wall on newly acquired land and simultaneously unveiled a tentative master plan for the project.\n\nThe boundary wall, estimated at ₹29 crore, will stretch 16.7 km and is expected to be completed within 456 days. This marks the first visible step in a comprehensive infrastructure expansion that aims to transform Coimbatore\'s aviation ecosystem over the next few years.\n\nTwo-Phase Expansion with Major Capacity Boost : The expansion blueprint covers construction of a new passenger terminal, cargo terminal, and ATC-cum-technical block, to be executed in two phases. A key highlight is the extension of the existing runway from 2,990 metres to 3,810 metres, enabling the airport to handle long-haul international flights and high-capacity aircraft.\n\nSignificant terminal upgrades are planned:\nAerobridges: Rising from 4 to 20\nRunway length: Expanding to 3,810 m\nOperational efficiency: Additional aprons and ramp systems to support higher aircraft movement\n\nThe master plan also proposes urban-scale amenities such as a dedicated bus terminal, multi-level car park, new approach road, and hospitality facilities including two mid-scale hotels and one premium hotel — underscoring a future-ready aerocity concept.',
    featured_image_url: '/news (12).jpeg',
    category_id: '8',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 2900,
    published_at: '2025-11-07T04:00:00Z'
  },
  {
    id: '13',
    title: 'NRI Investments in Coimbatore Real Estate Jump 35% as City Emerges a Tier-2 Powerhouse',
    slug: 'nri-investments-coimbatore-real-estate-35-percent',
    excerpt: 'Coimbatore\'s real estate market is entering a defining growth phase, powered by a sharp rise in NRI confidence and capital inflows.',
    content: 'Coimbatore:\nCoimbatore\'s real estate market is entering a defining growth phase, powered by a sharp rise in NRI confidence and capital inflows. Over the past year, housing demand from the Indian diaspora has surged by 35%, signalling a strategic shift toward high-potential tier-2 cities that offer value, infrastructure depth, and long-term livability.\n\nAt the heart of this momentum is a sweeping infrastructure upgrade redefining the urban landscape. The 139-km metro rail network — slated for completion by 2027 — will fundamentally transform mobility and unlock new investment corridors. Flyovers across key arterial routes such as Avinashi Road are already easing congestion and enabling seamless urban movement. These developments are not merely easing commutes; they are reshaping growth patterns and fast-tracking suburban emergence.\n\nNeighbourhoods like Saravanampatti, Thudiyalur, and Vadavalli are evolving into preferred residential and commercial clusters. Their proximity to IT hubs such as TIDEL Park, along with industrial ecosystems and cleaner, more spacious living environments, has positioned them as lifestyle-driven growth pockets. For NRIs, these areas tick both boxes — future appreciation and immediate quality-of-life benefits.\n\nPrice competitiveness remains a compelling advantage in Coimbatore\'s value proposition. Unlike Chennai or Bengaluru, the city offers premium real estate formats at significantly more accessible price points. Buyers can access integrated communities, gated enclaves, and smart-enabled homes without the inflation seen in metro markets. Demand spans 2BHK and 3BHK apartments as well as plotted developments, while affordable luxury — blending wellness features, smart technology, and community amenities — is steadily rising in appeal.',
    featured_image_url: '/news (13).jpeg',
    category_id: '5',
    author_id: '3',
    is_featured: false,
    is_breaking: false,
    views: 3600,
    published_at: '2025-11-07T03:30:00Z'
  },
  {
    id: '14',
    title: 'Adhyayana International School sports day',
    slug: 'adhyayana-international-school-sports-day',
    excerpt: 'Adhyayana International Public School, located at Poomanampalayam in Vadavalli, Coimbatore, organised its annual sports day celebrations with great enthusiasm.',
    content: 'Coimbatore:\nAdhyayana International Public School, located at Poomanampalayam in Vadavalli, Coimbatore, organised its annual sports day celebrations with great enthusiasm. The event began with competitions for students from Grades 1 to 5.\n\nThe sports meet was inaugurated by the chief guest, Sanganarayan, President of the School Management Committee, who lit the torch and declared the event open. The day\'s proceedings saw students actively participating in a variety of track and field events including running, long jump, high jump, shot put, and relay races.\n\nStudents who excelled in various events were honoured with medals and certificates. School Principal Anandh Kirubananthan, Vice-Principal Subbiah Anandh Kirubananthan, and Chief Guest Sanganarayan appreciated the winners and encouraged the participants to continue excelling in sports along with academics.',
    featured_image_url: '/news (14).jpeg',
    category_id: '3',
    author_id: '2',
    is_featured: false,
    is_breaking: false,
    views: 750,
    published_at: '2025-11-07T03:00:00Z'
  },
  {
    id: '15',
    title: 'PM Modi to Launch Ernakulam–Coimbatore Bharat Rail Tomorrow',
    slug: 'pm-modi-ernakulam-coimbatore-bharat-rail',
    excerpt: 'Prime Minister Narendra Modi will flag off a special Bharat Rail service from Ernakulam in Kerala to Coimbatore tomorrow.',
    content: 'Coimbatore,\nPrime Minister Narendra Modi will flag off a special Bharat Rail service from Ernakulam in Kerala to Coimbatore tomorrow for the convenience of passengers traveling between the two regions.\n\nThe Southern Railway announced that the service will operate between Ernakulam and Coimbatore to ease heavy passenger traffic on this route. As per the schedule, the special train will depart from Ernakulam Junction at 1:50 p.m. and reach Coimbatore at 5:10 p.m. The return journey from Coimbatore to Ernakulam will commence at 11 p.m. (Train No. 26652) and arrive at Ernakulam Junction by 2:20 a.m.\n\nPrime Minister Modi will formally inaugurate this new rail service tomorrow morning at 8 a.m. via video conference from Konnoli, marking another milestone in the region\'s enhanced rail connectivity.',
    featured_image_url: '/news (15).jpeg',
    category_id: '8',
    author_id: '1',
    is_featured: false,
    is_breaking: true,
    views: 4100,
    published_at: '2025-11-07T02:30:00Z'
  },
  {
    id: '16',
    title: 'Lakshmi Mills: From Industrial Legacy to Urban Landmark',
    slug: 'lakshmi-mills-industrial-legacy-urban-landmark',
    excerpt: 'Coimbatore\'s century-old Lakshmi Mills, once the pulsating heart of South India\'s textile industry, has been reborn as a vibrant urban and retail destination.',
    content: 'Coimbatore\'s century-old Lakshmi Mills, once the pulsating heart of South India\'s textile industry, has been reborn as a vibrant urban and retail destination. The transformation of this iconic 12-acre campus from a historic mill complex into a contemporary mixed-use hub marks a defining moment in Coimbatore\'s urban renewal journey.Originally established as one of India\'s pioneering textile hubs, Lakshmi Mills had long symbolized the entrepreneurial spirit of Tamil Nadu. Today, it stands at the crossroads of heritage and innovation, seamlessly blending industrial history with a modern commercial ecosystem.The redevelopment project, designed by architecture firm Studio Lotus under Ambrish Arora and Siddharth Talwar, began in phased expansions starting in 2021. With the first phase completed in 2023 and the second in 2024, the ongoing third phase continues to elevate the site\'s status as one of the most dynamic lifestyle and business centers in the city.Studio Lotus\' approach has been rooted in adaptive reuse. The architects retained much of the original structural character—brick facades, industrial detailing, and spatial layouts—integrating them with sustainable materials and modern climate-responsive techniques. Their vision: to make Lakshmi Mills both timeless and future-ready.Today, the redeveloped complex spans 125,000 square feet, hosting global retail brands, Coimbatore\'s first Starbucks, and curated cultural arenas. The site also features open-air food parks, landscaped pedestrian corridors, and social zones designed to foster community interaction.Footfalls tell the story of success. While weekdays attract between 2,500 and 3,500 visitors, weekends see this number surge to around 10,000. Businesses within the complex have reported sales growth surpassing initial projections by 15–20 percent. Enhanced parking facilities and integrated transport connectivity have further cemented its position as a premier city destination.Beyond its commercial footprint, Lakshmi Mills is a case study in sustainable urban transformation—demonstrating how dormant industrial assets can be reprogrammed into socially vibrant and economically resilient spaces. It represents not just the revival of a mill, but the redefinition of Coimbatore\'s identity as a forward-looking metropolis where history and modernity co-exist in harmony.',
    featured_image_url: '/news (16).jpeg',
    category_id: '6',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 3100,
    published_at: '2025-11-07T02:00:00Z'
  },
  {
    id: '17',
    title: 'New Traffic System Implementation in Coimbatore',
    slug: 'new-traffic-system-implementation-coimbatore',
    excerpt: 'Coimbatore Traffic Police announces the implementation of an advanced traffic management system across the city.',
    content: 'Coimbatore:\nThe Coimbatore Traffic Police announced the implementation of an advanced traffic management system across the city to tackle increasing traffic congestion. The new system includes smart signals, automatic number plate recognition cameras, and real-time traffic monitoring.\n\nThe initiative, part of the Smart City Mission, will cover 150 major intersections in the city. The smart traffic signals will automatically adjust timing based on real-time traffic conditions, reducing wait times by up to 40%.\n\nAdditionally, the system will feature emergency vehicle prioritization, which will allow ambulances and fire services to pass through intersections with minimal delays. The automatic number plate recognition cameras will help in tracking violations and stolen vehicles.\n\nTraffic Police Commissioner A. Saravana Sundar stated that the system will be implemented in phases, with the first phase covering the city center and major arterial roads. The second phase will extend to suburban areas.\n\nCitizens can also access real-time traffic information through a mobile application that will be launched alongside the new system. The app will provide alternative routes, real-time congestion updates, and parking availability information.',
    category_id: '8',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 1850,
    published_at: '2025-11-07T01:30:00Z'
  },
  {
    id: '18',
    title: 'Local Youth Wins Gold in National Swimming Championship',
    slug: 'local-youth-wins-gold-national-swimming',
    excerpt: '19-year-old Arjun Krishnan from Coimbatore won gold in the 200m freestyle event at the National Swimming Championship.',
    content: 'Coimbatore:\n19-year-old Arjun Krishnan from Coimbatore made the city proud by winning gold in the 200m freestyle event at the National Swimming Championship held in Bengaluru. Arjun completed the race in 1:48.32 seconds, setting a new national record for his age group.\n\nThis is not the first time Arjun has brought laurels to Coimbatore. He has previously won multiple state-level championships and has been training under renowned coach Rajesh Kumar for the past five years.\n\nHis coach praised Arjun\'s dedication and hard work, mentioning that he trains for six hours daily despite his college studies. The young swimmer aims to represent India in international competitions and hopes to qualify for the upcoming Asian Games.\n\nThe Coimbatore District Sports Development Authority has announced that they will provide Arjun with enhanced training facilities and support for his international aspirations. The state government has also announced a cash prize of ₹2 lakhs for his achievement.\n\nArjun\'s success has inspired many young swimmers in the city, and swimming academies in Coimbatore have reported a 30% increase in enrollments following his victory.',
    category_id: '4',
    author_id: '2',
    is_featured: false,
    is_breaking: false,
    views: 2200,
    published_at: '2025-11-07T01:00:00Z'
  },
  {
    id: '19',
    title: 'New IT Park Announced for Coimbatore',
    slug: 'new-it-park-announced-coimbatore',
    excerpt: 'The Tamil Nadu Government announced the establishment of a new 50-acre IT park in Coimbatore to boost employment opportunities.',
    content: 'Coimbatore:\nThe Tamil Nadu Government announced the establishment of a new 50-acre IT park in Coimbatore, which is expected to create 15,000 direct employment opportunities. The park will be developed in two phases over the next three years.\n\nThe first phase, covering 25 acres, will include office spaces for IT companies, co-working spaces, and recreational facilities. The second phase will focus on creating residential and commercial spaces for the IT professionals working in the park.\n\nChief Minister M.K. Stalin, while announcing the project, mentioned that the state government will provide various incentives to attract IT companies to set up their operations in the new park. These include tax exemptions, reduced electricity tariffs, and fast-track approvals for companies investing more than ₹50 crores.\n\nThe IT park will be equipped with state-of-the-art infrastructure, including high-speed internet connectivity, backup power systems, and green building certifications. The government also plans to develop skill development centers within the park to train local youth for IT jobs.\n\nSeveral leading IT companies have already shown interest in establishing their regional headquarters in the new park. The project is expected to attract an investment of ₹5,000 crores over the next five years.',
    category_id: '2',
    author_id: '3',
    is_featured: false,
    is_breaking: false,
    views: 3400,
    published_at: '2025-11-07T00:30:00Z'
  },
  {
    id: '20',
    title: 'Coimbatore Sees Surge in Digital Payment Adoption',
    slug: 'coimbatore-surge-digital-payment-adoption',
    excerpt: 'Local merchants report significant increase in UPI and digital wallet transactions following government initiatives.',
    content: 'Coimbatore:\nLocal merchants across Coimbatore are reporting a significant surge in digital payment adoption, with UPI and digital wallet transactions increasing by over 60% in the past six months. This trend is attributed to various government initiatives promoting cashless transactions and the widespread availability of digital payment infrastructure.\n\nThe Confederation of All India Traders (CAIT) Coimbatore chapter has been instrumental in educating small businesses about the benefits of digital payments. They have conducted over 100 workshops across the city, training merchants on using various digital payment platforms.\n\nKey factors driving this adoption include the ease of transaction, reduced cash handling costs, and better record-keeping capabilities. Many merchants have also noted that younger customers prefer digital payments, and accepting these methods has helped them attract more footfall.\n\nThe State Bank of India has reported that Coimbatore ranks among the top 10 cities in Tamil Nadu for digital payment transactions. The bank has installed over 500 new POS machines across the city in the past year to support this growing trend.\n\nLocal businesses are also leveraging digital payment data to better understand customer preferences and optimize their inventory accordingly. This data-driven approach has helped many small retailers improve their profitability and compete more effectively with larger chains.',
    category_id: '2',
    author_id: '3',
    is_featured: false,
    is_breaking: false,
    views: 1950,
    published_at: '2025-11-07T00:00:00Z'
  },
  {
    id: '21',
    title: 'Coimbatore District Collector Reviews Monsoon Preparedness',
    slug: 'coimbatore-district-collector-monsoon-preparedness',
    excerpt: 'District Collector S. Sivarasu chairs high-level meeting to review preparedness for northeast monsoon season.',
    content: 'Coimbatore:\nDistrict Collector S. Sivarasu chaired a high-level meeting on Monday to review the preparedness of various departments for the upcoming northeast monsoon season. The meeting was attended by officials from the Public Works Department, Corporation, Police, Fire and Rescue Services, and the State Disaster Response Force.\n\nThe Collector emphasized the importance of proactive measures to prevent waterlogging and ensure the smooth functioning of drainage systems. He instructed the Corporation to clear all major drains and storm water channels before the onset of rains.\n\nThe Public Works Department was directed to ensure that all major roads are in good condition and that there are no potholes or damaged surfaces that could cause inconvenience to commuters during heavy rainfall.\n\nThe Police department was asked to identify vulnerable points in the city where water logging commonly occurs and to deploy additional personnel to manage traffic during heavy rains.\n\nFire and Rescue Services were instructed to keep emergency response teams on standby and to ensure that all equipment is in working condition. The SDRF teams were asked to be ready for any emergency situation that might arise during the monsoon.\n\nThe Collector also reviewed the availability of essential supplies and equipment for flood relief operations and directed the concerned departments to maintain adequate stock of emergency supplies.',
    category_id: '1',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 1650,
    published_at: '2025-11-06T23:30:00Z'
  },
  {
    id: '22',
    title: 'Coimbatore Medical College Holds Annual Research Conference',
    slug: 'coimbatore-medical-college-research-conference',
    excerpt: 'Government Medical College and ESI Hospital hosts annual research conference showcasing latest medical research findings.',
    content: 'Coimbatore:\nThe Government Medical College and ESI Hospital here hosted its annual research conference on Saturday, showcasing the latest findings in medical research from faculty and students. The conference, which was held at the hospital auditorium, saw participation from over 200 medical professionals and research scholars.\n\nDr. R. Murugan, Principal of the medical college, inaugurated the conference and highlighted the importance of research in improving healthcare outcomes. He emphasized that research should not be limited to big medical institutions but should be pursued by all healthcare professionals to contribute to the advancement of medical science.\n\nThe conference featured 25 research presentations covering various fields including cardiology, neurology, oncology, and infectious diseases. The presentations were evaluated by a panel of experts from various medical institutions across Tamil Nadu.\n\nDr. S. Rajasekaran from the Department of Cardiology presented his research on early detection of heart diseases using AI-based diagnostic tools. His research, which has been published in several international journals, showed promising results in identifying cardiac abnormalities with 95% accuracy.\n\nThe conference also included workshops on research methodology and scientific writing, which were conducted by senior faculty members. These workshops aimed to help young doctors and researchers improve their research skills and publish their findings in peer-reviewed journals.\n\nThe best research presentation award was given to Dr. K. Meenakshi from the Department of Microbiology for her work on antibiotic resistance patterns in hospital-acquired infections.',
    category_id: '3',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 1280,
    published_at: '2025-11-06T23:00:00Z'
  },
  {
    id: '23',
    title: 'Coimbatore Corporation Launches Smart Waste Management System',
    slug: 'coimbatore-corporation-smart-waste-management',
    excerpt: 'New IoT-enabled waste bins and collection vehicles to be deployed across the city to improve waste management efficiency.',
    content: 'Coimbatore:\nThe Coimbatore City Municipal Corporation announced the launch of a smart waste management system that will use Internet of Things (IoT) technology to improve waste collection efficiency and reduce operational costs.\n\nThe system involves the installation of 500 smart bins across the city that are equipped with sensors to detect when they are full and send real-time alerts to the waste collection control room. This will ensure that bins are emptied only when necessary, reducing unnecessary collection trips and fuel consumption.\n\nThe Corporation has also procured 50 new smart waste collection vehicles that are equipped with GPS tracking and route optimization software. These vehicles will be able to identify the most efficient routes to collect waste from full bins, reducing collection time by up to 30%.\n\nMayor A. Kalaiselvi, while launching the system, said that the initiative is part of the city\'s commitment to become a smart city and to improve the quality of life for its citizens. She added that the system will also help in reducing greenhouse gas emissions from waste collection vehicles.\n\nThe system will be implemented in phases, with the first phase covering the city center and major commercial areas. The second phase will extend to residential areas in the city.\n\nCitizens will also be able to use a mobile application to report overflowing bins or any issues with waste management in their area. The app will allow users to upload photos and provide exact location details, making it easier for the Corporation to address complaints quickly.\n\nThe smart waste management system is expected to reduce waste collection costs by 25% and improve the overall cleanliness of the city.',
    category_id: '1',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 1750,
    published_at: '2025-11-06T22:30:00Z'
  },
  {
    id: '24',
    title: 'PSG College of Arts and Science Wins Best College Award',
    slug: 'psg-college-arts-science-wins-award',
    excerpt: 'PSG College of Arts and Science receives prestigious award for excellence in education and research.',
    content: 'Coimbatore:\nPSG College of Arts and Science has been conferred the prestigious Best College Award by the Education Development Foundation for its excellence in education and research. The award ceremony was held in Chennai recently, and the college was selected from among over 500 institutions that participated in the competition.\n\nThe award recognizes the college\'s outstanding performance in various areas including academic excellence, research output, infrastructure development, and student satisfaction. The evaluation was based on parameters such as faculty qualifications, library resources, laboratory facilities, and placement records.\n\nPrincipal Dr. R. Chandrasekhar, who received the award on behalf of the college, said that this recognition is a testament to the hard work and dedication of the faculty, staff, and students. He emphasized that the college has been consistently focusing on providing quality education and conducting innovative research.\n\nThe college has been particularly noted for its research output, with faculty and students publishing over 200 research papers in peer-reviewed journals in the past year. The college has also secured research grants worth ₹2 crores from various funding agencies.\n\nThe placement record of the college has also been impressive, with over 90% of graduates securing employment in reputed companies. The college has strong industry connections and regularly organizes placement drives in collaboration with leading companies.\n\nDr. Chandrasekhar announced that the college plans to use the award money to further improve its infrastructure and research facilities. The college is also planning to start new programs in emerging areas such as data science and artificial intelligence.',
    category_id: '3',
    author_id: '1',
    is_featured: false,
    is_breaking: false,
    views: 1450,
    published_at: '2025-11-06T22:00:00Z'
  }
];
*/
export const articles: Article[] = [];

// Helper functions - Commented out as they depend on mock data
/*
export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};

export const getAuthorById = (id: string): Author | undefined => {
  return authors.find(author => author.id === id);
};

export const getArticlesByCategory = (categoryId: string): Article[] => {
  return articles.filter(article => article.category_id === categoryId);
};

export const getFeaturedArticles = (): Article[] => {
  return articles.filter(article => article.is_featured);
};

export const getBreakingNews = (): Article[] => {
  return articles.filter(article => article.is_breaking);
};

export const getTrendingArticles = (): Article[] => {
  return articles.sort((a, b) => b.views - a.views).slice(0, 5);
};

export const getMostReadArticles = (): Article[] => {
  return articles.sort((a, b) => b.views - a.views).slice(0, 5);
};

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find(article => article.slug === slug);
};

export const getRelatedArticles = (articleId: string, categoryId: string, limit: number = 3): Article[] => {
  return articles
    .filter(article => article.id !== articleId && article.category_id === categoryId)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

export const searchArticles = (searchTerm: string): Article[] => {
  const term = searchTerm.toLowerCase();
  return articles
    .filter(article =>
      article.title.toLowerCase().includes(term) ||
      article.excerpt.toLowerCase().includes(term) ||
      article.content.toLowerCase().includes(term)
    )
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
};

export interface EpaperIssue {
  id: string;
  issue_date: string;
  pdf_url: string;
  cover_image_url?: string;
  page_count: number;
  created_at: string;
}

export const epaperIssues: EpaperIssue[] = [
  {
    id: '1',
    issue_date: '2025-11-07',
    pdf_url: '/epapers/2025-11-07.pdf',
    cover_image_url: '/news (1).jpeg',
    page_count: 12,
    created_at: '2025-11-07T06:00:00Z'
  },
  {
    id: '2',
    issue_date: '2025-11-06',
    pdf_url: '/epapers/2025-11-06.pdf',
    cover_image_url: '/news (2).jpeg',
    page_count: 10,
    created_at: '2025-11-06T06:00:00Z'
  },
  {
    id: '3',
    issue_date: '2025-11-05',
    pdf_url: '/epapers/2025-11-05.pdf',
    cover_image_url: '/news (3).jpeg',
    page_count: 14,
    created_at: '2025-11-05T06:00:00Z'
  }
];

export const getEpaperIssues = (startDate?: Date, endDate?: Date): EpaperIssue[] => {
  let filtered = epaperIssues;

  if (startDate) {
    filtered = filtered.filter(issue => new Date(issue.issue_date) >= startDate);
  }

  if (endDate) {
    filtered = filtered.filter(issue => new Date(issue.issue_date) <= endDate);
  }

  return filtered.sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());
};

// Helper functions - Commented out as they depend on mock data
/*
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(category => category.slug === slug);
};

export const getArticlesByCategorySlug = (categorySlug: string, page: number = 1, limit: number = 12): Article[] => {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return [];

  const categoryArticles = articles.filter(article => article.category_id === category.id);
  const start = (page - 1) * limit;
  const end = start + limit;

  return categoryArticles
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(start, end);
};

export const getTotalArticlesByCategorySlug = (categorySlug: string): number => {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return 0;

  return articles.filter(article => article.category_id === category.id).length;
};
*/

// Add categories and authors to articles - Commented out as it depends on mock data
/*
articles.forEach(article => {
  article.categories = getCategoryById(article.category_id);
  article.authors = getAuthorById(article.author_id);
});
*/