export type Property = {
  slug: string;
  title: string;
  location: string;
  region: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  lot: string;
  status: "For Sale" | "Private Listing" | "Under Offer";
  type: string;
  year: number;
  image: string;
  gallery: string[];
  blurb: string;
  description: string[];
  features: string[];
  featured?: boolean;
  agent: string;
};

export const properties: Property[] = [
  {
    slug: "cliffside-estate-malibu",
    title: "Cliffside Estate",
    location: "Malibu, California",
    region: "Pacific Coast",
    price: 28_500_000,
    beds: 6,
    baths: 8,
    area: 11_400,
    lot: "1.8 acres",
    status: "For Sale",
    type: "Contemporary Estate",
    year: 2021,
    image: "/media/p1.jpg",
    gallery: ["/media/p1.jpg", "/media/p6.jpg", "/media/p4.jpg", "/media/p12.jpg"],
    blurb: "A glass pavilion set into the bluff, with 180 feet of private ocean frontage.",
    description: [
      "Perched on a sandstone bluff above the Pacific, this six-bedroom pavilion was conceived as a single continuous line between sky and water. Full-height glazing slides entirely into pocket walls, dissolving the boundary between the great room and the terrace beyond.",
      "Materials were kept deliberately quiet — honed travertine, white oak, blackened steel — so that the horizon does the work. A private stair descends through native planting to 180 feet of protected shoreline.",
    ],
    features: [
      "180 ft private ocean frontage",
      "Infinity edge pool & spa",
      "Glass-walled wine room (1,200 bottles)",
      "Four-car subterranean garage",
      "Seismic base isolation",
      "Full home automation",
    ],
    featured: true,
    agent: "eleanor-vance",
  },
  {
    slug: "the-athenaeum-kensington",
    title: "The Athenaeum",
    location: "Kensington, London",
    region: "Europe",
    price: 19_200_000,
    beds: 5,
    baths: 5,
    area: 7_300,
    lot: "Garden square",
    status: "Private Listing",
    type: "Georgian Townhouse",
    year: 1843,
    image: "/media/p2.jpg",
    gallery: ["/media/p2.jpg", "/media/p7.jpg", "/media/p10.jpg", "/media/p5.jpg"],
    blurb: "A Grade II listed townhouse restored over four years by John Pawson's studio.",
    description: [
      "Behind a restrained stucco façade lies one of Kensington's most considered restorations: four years of work that returned a crooked, subdivided Georgian house to a single, calm family home.",
      "The plan opens downward rather than up — a garden-level kitchen carved beneath the original cellar now draws light through a frameless roof light the length of the room.",
    ],
    features: [
      "Grade II listed",
      "Private garden square key",
      "Lift to all six floors",
      "Original adam ceiling restored",
      "Geothermal heating",
      "Staff flat with separate entrance",
    ],
    featured: true,
    agent: "james-okafor",
  },
  {
    slug: "villa-soleil-cap-ferrat",
    title: "Villa Soleil",
    location: "Saint-Jean-Cap-Ferrat, France",
    region: "Mediterranean",
    price: 34_000_000,
    beds: 7,
    baths: 9,
    area: 12_800,
    lot: "2.4 acres",
    status: "For Sale",
    type: "Belle Époque Villa",
    year: 1912,
    image: "/media/p3.jpg",
    gallery: ["/media/p3.jpg", "/media/p8.jpg", "/media/p11.jpg", "/media/p2.jpg"],
    blurb: "Belle Époque bones, a Matisse provenance, and the finest south-facing terrace on the cap.",
    description: [
      "Built for a Lyonnaise silk family in 1912 and held privately ever since, Villa Soleil occupies the most coveted south-facing shelf on Cap Ferrat.",
      "Matisse painted three canvases from the upper terrace between 1918 and 1921. The gardens — terraced, walled, and largely original — descend to a boathouse and deep-water mooring.",
    ],
    features: [
      "Direct sea access & boathouse",
      "Deep-water mooring for 18m vessel",
      "Original 1912 mosaic pools",
      "Guest pavilion (2 bedrooms)",
      "Staff quarters (3 bedrooms)",
      "Helipad on common land",
    ],
    featured: true,
    agent: "eleanor-vance",
  },
  {
    slug: "casa-loma-oaxaca",
    title: "Casa Loma",
    location: "Oaxaca de Juárez, Mexico",
    region: "Americas",
    price: 6_400_000,
    beds: 5,
    baths: 6,
    area: 6_100,
    lot: "0.6 acres",
    status: "For Sale",
    type: "Courtyard House",
    year: 2019,
    image: "/media/p4.jpg",
    gallery: ["/media/p4.jpg", "/media/p9.jpg", "/media/p6.jpg", "/media/p1.jpg"],
    blurb: "Rammed earth, volcanic stone, and a courtyard that cools the house without air conditioning.",
    description: [
      "A contemporary take on the Oaxacan courtyard house, built by a local collective using rammed earth quarried within forty kilometres of the site.",
      "The plan folds around two shaded courts. Cross-ventilation keeps the interior within three degrees of the outside air year round — the house has never needed mechanical cooling.",
    ],
    features: [
      "Rammed earth construction",
      "Two shaded courtyards",
      "Rainwater harvesting (40,000 L)",
      "Rooftop observatory",
      "Art studio with north light",
      "Solar array & battery bank",
    ],
    agent: "sofia-reyes",
  },
  {
    slug: "north-shore-retreat-aspen",
    title: "North Shore Retreat",
    location: "Aspen, Colorado",
    region: "Mountains",
    price: 22_750_000,
    beds: 6,
    baths: 7,
    area: 9_600,
    lot: "3.2 acres",
    status: "Under Offer",
    type: "Mountain Modern",
    year: 2022,
    image: "/media/p5.jpg",
    gallery: ["/media/p5.jpg", "/media/p11.jpg", "/media/p8.jpg", "/media/p4.jpg"],
    blurb: "Ski-in from the ridge, then drop into a double-height great room facing the Elk Range.",
    description: [
      "Sited on a private bench above the West Buttress, the house reads as three timber volumes stepping with the terrain.",
      "The great room is framed in reclaimed Douglas fir and opens onto a heated terrace with views across the valley to the Maroon Bells.",
    ],
    features: [
      "True ski-in / ski-out",
      "Heated 60-ft lap pool",
      "Wellness wing: sauna, hammam, cold plunge",
      "Ski room & boot dryers",
      "Caretaker's cottage",
      "Snowmelt drive",
    ],
    agent: "marcus-chen",
  },
  {
    slug: "maison-du-quai-paris",
    title: "Maison du Quai",
    location: "7th Arrondissement, Paris",
    region: "Europe",
    price: 14_900_000,
    beds: 4,
    baths: 4,
    area: 4_800,
    lot: "Full floor",
    status: "Private Listing",
    type: "Haussmannian Apartment",
    year: 1868,
    image: "/media/p6.jpg",
    gallery: ["/media/p6.jpg", "/media/p12.jpg", "/media/p2.jpg", "/media/p7.jpg"],
    blurb: "A full-floor residence on the Left Bank with uninterrupted views to the Eiffel Tower.",
    description: [
      "One floor, one apartment, one view. The entire quai-facing level of an 1868 building was reassembled into a single residence by Studio KO.",
      "Six windows run the length of the principal enfilade; the floor is a herringbone oak laid in the original pattern and lifted, numbered, and relaid.",
    ],
    features: [
      "Full-floor, no shared walls",
      "Views to the Eiffel Tower",
      "Original parquet relaid",
      "Private lift landing",
      "Cellar (85 m²)",
      "Concierge & courtyard parking",
    ],
    agent: "james-okafor",
  },
  {
    slug: "the-orchard-cotswolds",
    title: "The Orchard",
    location: "Chipping Norton, Cotswolds",
    region: "Europe",
    price: 8_750_000,
    beds: 7,
    baths: 6,
    area: 8_200,
    lot: "14 acres",
    status: "For Sale",
    type: "Manor & Farmland",
    year: 1720,
    image: "/media/p7.jpg",
    gallery: ["/media/p7.jpg", "/media/p3.jpg", "/media/p10.jpg", "/media/p5.jpg"],
    blurb: "Fourteen acres of walled orchard, a 1720 manor, and a converted threshing barn.",
    description: [
      "A rare complete holding: a grade II* manor, walled kitchen garden, twelve acres of grazing, and a threshing barn consented as an event space.",
      "The current owners planted 340 heritage apple trees in 2016; the cider house produces under the farm's own label.",
    ],
    features: [
      "14 acres, fully walled",
      "Grade II* manor house",
      "Consented event barn",
      "Cider house & press",
      "Stables (6 boxes)",
      "Two-bedroom gatehouse",
    ],
    agent: "james-okafor",
  },
  {
    slug: "skyline-residence-singapore",
    title: "Skyline Residence",
    location: "Orchard Road, Singapore",
    region: "Asia Pacific",
    price: 11_300_000,
    beds: 4,
    baths: 5,
    area: 5_400,
    lot: "Penthouse",
    status: "For Sale",
    type: "Penthouse",
    year: 2023,
    image: "/media/p8.jpg",
    gallery: ["/media/p8.jpg", "/media/p6.jpg", "/media/p4.jpg", "/media/p12.jpg"],
    blurb: "A double-height penthouse above the canopy, with a 40-metre sky terrace.",
    description: [
      "Occupying the top two floors of a 42-storey tower, the residence is organised around a double-height living volume facing the reservoir.",
      "A private lift opens directly into the apartment. The sky terrace runs the full western elevation and is planted with mature frangipani.",
    ],
    features: [
      "Private lift entrance",
      "40 m sky terrace",
      "Double-height living volume",
      "Staff suite (2 rooms)",
      "24-hour concierge & security",
      "Resident club & lap pool",
    ],
    agent: "marcus-chen",
  },
  {
    slug: "finca-terra-mallorca",
    title: "Finca Terra",
    location: "Deià, Mallorca",
    region: "Mediterranean",
    price: 9_600_000,
    beds: 6,
    baths: 6,
    area: 6_900,
    lot: "5.1 acres",
    status: "For Sale",
    type: "Restored Finca",
    year: 1780,
    image: "/media/p9.jpg",
    gallery: ["/media/p9.jpg", "/media/p3.jpg", "/media/p11.jpg", "/media/p7.jpg"],
    blurb: "A 1780 finca above Deià, restored in lime and timber with terraces to the sea.",
    description: [
      "Two centuries of additions were stripped back to the original stone envelope, then rebuilt in lime mortar, chestnut, and terracotta by a Mallorcan atelier.",
      "Five terraces step down the hillside through olive and almond to a spring-fed pool.",
    ],
    features: [
      "Restored 1780 structure",
      "Spring-fed swimming pool",
      "5 productive olive terraces",
      "Wood-fired oven & summer kitchen",
      "Guest cottage (2 bedrooms)",
      "EV charging & solar",
    ],
    agent: "sofia-reyes",
  },
  {
    slug: "harbour-house-sydney",
    title: "Harbour House",
    location: "Point Piper, Sydney",
    region: "Asia Pacific",
    price: 26_000_000,
    beds: 5,
    baths: 6,
    area: 7_800,
    lot: "1,010 m²",
    status: "Private Listing",
    type: "Waterfront Modern",
    year: 2020,
    image: "/media/p10.jpg",
    gallery: ["/media/p10.jpg", "/media/p1.jpg", "/media/p8.jpg", "/media/p5.jpg"],
    blurb: "Northerly harbour frontage with a private wharf and deep-water jetty.",
    description: [
      "One of only eleven addresses on the eastern shore with direct private wharf access, Harbour House was rebuilt from the frame out over three years.",
      "Living spaces occupy the harbour level; bedrooms step back and up into the sandstone above for privacy and quiet.",
    ],
    features: [
      "Private wharf & jetty",
      "Northerly harbour aspect",
      "Infinity pool to the water",
      "Gym, sauna & massage room",
      "Three-car garage + turntable",
      "Lift to all levels",
    ],
    agent: "marcus-chen",
  },
  {
    slug: "ranch-nine-elk-montana",
    title: "Ranch Nine",
    location: "Big Sky, Montana",
    region: "Mountains",
    price: 17_400_000,
    beds: 5,
    baths: 5,
    area: 6_400,
    lot: "340 acres",
    status: "For Sale",
    type: "Working Ranch",
    year: 2018,
    image: "/media/p11.jpg",
    gallery: ["/media/p11.jpg", "/media/p5.jpg", "/media/p9.jpg", "/media/p10.jpg"],
    blurb: "Three hundred and forty deeded acres with a spring-fed lake and working barn.",
    description: [
      "A genuine working ranch on 340 deeded acres, bordering eleven miles of national forest on two sides.",
      "The main house sits low against the meadow; a second residence and staff quarters sit half a mile north along the creek.",
    ],
    features: [
      "340 deeded acres",
      "11 miles of forest boundary",
      "Spring-fed lake & creek rights",
      "Main house + guest residence",
      "Working barn & equipment shed",
      "Conservation easement in place",
    ],
    agent: "marcus-chen",
  },
  {
    slug: "casa-verde-quetzaltenango",
    title: "Casa Verde",
    location: "Antigua, Guatemala",
    region: "Americas",
    price: 4_950_000,
    beds: 6,
    baths: 7,
    area: 7_100,
    lot: "1.2 acres",
    status: "For Sale",
    type: "Colonial Hacienda",
    year: 1698,
    image: "/media/p12.jpg",
    gallery: ["/media/p12.jpg", "/media/p4.jpg", "/media/p9.jpg", "/media/p6.jpg"],
    blurb: "A 1698 hacienda beneath Volcán de Agua, with six cloistered courtyards.",
    description: [
      "Built in 1698 and never subdivided, Casa Verde retains six courtyards, an original aqueduct, and a chapel with its 1740 altarpiece intact.",
      "Restoration over the past decade has been led by Guatemala's Instituto de Antropología e Historia.",
    ],
    features: [
      "Built 1698 — original fabric",
      "Six courtyards & aqueduct",
      "Historic chapel (1740)",
      "Tiled lap pool",
      "Two-bedroom caretaker's house",
      "Volcán de Agua views",
    ],
    agent: "sofia-reyes",
  },
];

export type Agent = {
  slug: string;
  name: string;
  role: string;
  image: string;
  phone: string;
  email: string;
  languages: string;
  focus: string;
  bio: string;
};

export const agents: Agent[] = [
  {
    slug: "eleanor-vance",
    name: "Eleanor Vance",
    role: "Founding Partner",
    image: "/media/a1.jpg",
    phone: "+1 310 555 0142",
    email: "eleanor@vensamproperties.estate",
    languages: "English, French",
    focus: "Coastal California · Côte d'Azur",
    bio: "Twenty-two years placing architecturally significant homes with families who intend to keep them.",
  },
  {
    slug: "james-okafor",
    name: "James Okafor",
    role: "Partner, Europe",
    image: "/media/a3.jpg",
    phone: "+44 20 7946 0118",
    email: "james@vensamproperties.estate",
    languages: "English, Italian",
    focus: "London · Paris · Cotswolds",
    bio: "Formerly a conservation architect. Advises on listed buildings, planning risk, and long-cycle acquisitions.",
  },
  {
    slug: "sofia-reyes",
    name: "Sofía Reyes",
    role: "Director, Americas",
    image: "/media/a2.jpg",
    phone: "+52 55 5555 0193",
    email: "sofia@vensamproperties.estate",
    languages: "Spanish, English, Portuguese",
    focus: "Mexico · Guatemala · Mallorca",
    bio: "Specialises in historic properties with restoration complexity and cross-border title.",
  },
  {
    slug: "marcus-chen",
    name: "Marcus Chen",
    role: "Director, Pacific & Mountains",
    image: "/media/a5.jpg",
    phone: "+1 650 555 0177",
    email: "marcus@vensamproperties.estate",
    languages: "English, Mandarin",
    focus: "Aspen · Sydney · Singapore",
    bio: "Ex-merchant banker. Structures the acquisitions that rarely reach an open market.",
  },
  {
    slug: "naomi-hart",
    name: "Naomi Hart",
    role: "Head of Private Office",
    image: "/media/a4.jpg",
    phone: "+1 212 555 0166",
    email: "naomi@vensamproperties.estate",
    languages: "English, German",
    focus: "Client services · Discreet sales",
    bio: "Runs the private office: off-market mandates, family offices, and the quiet half of our work.",
  },
  {
    slug: "david-ashworth",
    name: "David Ashworth",
    role: "Head of Research",
    image: "/media/a6.jpg",
    phone: "+44 20 7946 0125",
    email: "david@vensamproperties.estate",
    languages: "English",
    focus: "Market intelligence · Valuation",
    bio: "Writes the Vensam Properties Index. Twenty years of pricing data across fourteen prime markets.",
  },
];

export const neighborhoods = [
  { name: "Malibu", count: 14, image: "/media/n1.jpg", note: "Pacific Coast" },
  { name: "Kensington", count: 9, image: "/media/n2.jpg", note: "London" },
  { name: "Cap Ferrat", count: 6, image: "/media/n3.jpg", note: "Côte d'Azur" },
  { name: "Aspen", count: 11, image: "/media/n4.jpg", note: "Colorado" },
  { name: "Deià", count: 5, image: "/media/n5.jpg", note: "Mallorca" },
];

export const journal = [
  {
    slug: "the-quiet-return-of-the-architect-s-house",
    title: "The Quiet Return of the Architect's House",
    category: "Perspective",
    date: "March 2026",
    read: "8 min",
    image: "/media/b1.jpg",
    excerpt:
      "For a decade, prime buyers chased square footage. The last two years have gone the other way — toward authorship, provenance, and fewer, better rooms.",
  },
  {
    slug: "how-we-price-a-house-that-has-never-sold",
    title: "How We Price a House That Has Never Sold",
    category: "Method",
    date: "February 2026",
    read: "6 min",
    image: "/media/b2.jpg",
    excerpt:
      "Off-market property has no comparables. Our research team explains the four-part test we apply before a private mandate is ever priced.",
  },
  {
    slug: "fourteen-prime-markets-one-index",
    title: "Fourteen Prime Markets, One Index",
    category: "Research",
    date: "January 2026",
    read: "11 min",
    image: "/media/b3.jpg",
    excerpt:
      "The Vensam Properties Index closed the year up 4.1 per cent. What the headline hides — and where the real movement was.",
  },
  {
    slug: "notes-on-restoring-a-house-you-did-not-build",
    title: "Notes on Restoring a House You Did Not Build",
    category: "Craft",
    date: "December 2025",
    read: "9 min",
    image: "/media/b4.jpg",
    excerpt:
      "Three of our clients spent more on the repair than the purchase. All three say they would do it again. We asked them why.",
  },
];

export const testimonials = [
  {
    quote:
      "They showed us four houses. We bought the second. In twenty years of buying property, nobody has ever been that unsentimental about what we didn't need.",
    name: "Private client",
    detail: "Acquisition, Malibu — 2025",
  },
  {
    quote:
      "Vensam Properties sold a house that had been on the market with two other agents for three years. It took eleven days and one photograph.",
    name: "Vendor",
    detail: "Discreet sale, Kensington — 2025",
  },
  {
    quote:
      "The research was better than the bank's. We made the offer on the strength of their numbers, not our instincts.",
    name: "Family office",
    detail: "Portfolio advisory — 2024",
  },
];

export const stats = [
  { value: "$14.2B", label: "Transacted since 2009" },
  { value: "41", label: "Countries advised" },
  { value: "96%", label: "Mandates off-market" },
  { value: "17", label: "Years, one standard" },
];

export const services = [
  {
    n: "01",
    title: "Private Acquisition",
    body: "The majority of what we sell is never advertised. We source against a brief, test the structure, and negotiate on your behalf without a competing bidder in the room.",
    points: ["Off-market sourcing", "Title & planning diligence", "Negotiation & structuring"],
  },
  {
    n: "02",
    title: "Discreet Sale",
    body: "For vendors who cannot afford a board on the lawn. A curated approach to a pre-qualified audience, with photography released only when the buyer is already in the room.",
    points: ["Pre-qualified audience", "No public listing", "Sealed or guided process"],
  },
  {
    n: "03",
    title: "Portfolio Advisory",
    body: "Family offices and long-horizon holders use us to rebalance across borders — where to add, where to exit, and what a market will look like in a decade rather than a quarter.",
    points: ["The Vensam Properties Index", "Cross-border structuring", "Hold / exit modelling"],
  },
  {
    n: "04",
    title: "Restoration & Delivery",
    body: "Buying the house is the easy part. We manage architects, conservation officers, and contractors through completion — for clients who are often not in the country.",
    points: ["Architect selection", "Consent & conservation", "Cost and programme control"],
  },
];
