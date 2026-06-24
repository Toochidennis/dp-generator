// All copy for the Kids Coding Bootcamp microsite lives here so the pages stay
// presentational. Content is grounded in Digital Dreams' real ICT academy
// offerings (Scratch, web, Python, robotics, AI) and written for two readers
// at once: parents deciding, and kids getting excited.

export type Accent = "brand" | "blue" | "mint" | "coral";

export const event = {
  brand: "Digital Dreams",
  brandTagline: "Let's make your dream a reality.",
  name: "Kids Coding Bootcamp",
  year: "2026",
  tagline: "Learn. Create. Code. Innovate.",
  blurb:
    "A hands-on coding bootcamp — onsite and online — where curious kids go from playing games to building them, guided by Digital Dreams coaches who've trained Nigeria's developers since 2007.",
  format: "Onsite & Online",
  // The earliest intake (Genius Track) opens 1 July 2026 — drives the countdown.
  dateLabel: "Starts 1 July 2026",
  dateShort: "From Jul 2026",
  startISO: "2026-07-01T09:00:00+01:00",
  timeLabel: "9:00 AM – 2:00 PM daily",
  venue: "Digital Dreams Academy",
  venueAddress: "No. 1 Nwodo Street, GRA, Enugu",
  venueCity: "GRA, Enugu",
  ageLabel: "Ages 7–15",
  groupLabel: "Max 8 kids per coach",
  feeLabel: "₦60,000",
  feeNote: "early-bird, all materials included",
  seatsLabel: "40 seats only",
  // Contact / registration — from the flyer.
  registerUrl: "https://bit.ly/4efFcRy?r=qr",
  phone: "09064660137",
  social: "DigitalDreamslimited",
  badgeId: "KCB-2026",
} as const;

export const heroStats = [
  { value: "8", label: "hands-on courses" },
  { value: "2", label: "learning tracks" },
  { value: "1–2", label: "months long" },
  { value: "7–15", label: "age range" },
];

// Hero decoration — Scratch-style command blocks.
export const codeBlocks: { label: string; accent: Accent; rot: number }[] = [
  { label: "when ▶ clicked", accent: "brand", rot: -4 },
  { label: "move 10 steps", accent: "blue", rot: 3 },
  { label: "repeat 10", accent: "mint", rot: -2 },
  { label: 'say "Hi, world!"', accent: "coral", rot: 5 },
];

export const about = {
  kicker: "// about the bootcamp",
  title: "Not another screen-time camp.",
  body: [
    "Kids Coding Bootcamp is a real software studio for young builders — onsite or online. Children don't watch tutorials; they ship projects: a published webpage, a playable game, a Python program, a 3D animation, and a robot that responds to the world.",
    "We keep groups tiny (never more than eight kids per coach) and sort children by age and pace, so a total beginner and a returning coder both leave stretched, not bored.",
  ],
  pillars: [
    { title: "Build, don't watch", body: "60% hands-on keyboard time. Every class ends with something that runs.", accent: "brand" as Accent },
    { title: "Coaches who ship", body: "Led by Digital Dreams engineers — a top-10 Nigerian ICT firm since 2007.", accent: "blue" as Accent },
    { title: "Demo Day finish", body: "Kids present to parents and take home a certificate and their projects.", accent: "mint" as Accent },
  ],
};

export const modules: {
  no: string;
  title: string;
  tag: string;
  body: string;
  accent: Accent;
}[] = [
  {
    no: "01",
    title: "Computer Basics & Scratch",
    tag: "scratch",
    body: "Start from zero: real computer skills, then snap blocks together in Scratch to make sprites move, talk and react.",
    accent: "mint",
  },
  {
    no: "02",
    title: "Web Development",
    tag: "front end",
    body: "Write actual HTML and CSS, choose colours and layout, then publish a front-end page kids can share with family.",
    accent: "blue",
  },
  {
    no: "03",
    title: "Python",
    tag: "python",
    body: "Step up to typed code — variables, logic and small programs written in a few real lines of Python.",
    accent: "brand",
  },
  {
    no: "04",
    title: "Graphic Design",
    tag: "design",
    body: "Design posters, logos and graphics with real design tools, learning colour, layout and type along the way.",
    accent: "coral",
  },
  {
    no: "05",
    title: "3D Animation",
    tag: "basics",
    body: "Bring characters and scenes to life with the basics of 3D animation — modelling, movement and storytelling.",
    accent: "mint",
  },
  {
    no: "06",
    title: "Robotics",
    tag: "hardware",
    body: "Code that touches the real world: build and program robots with sensors, motors and lights that respond to you.",
    accent: "blue",
  },
  {
    no: "07",
    title: "Android Development",
    tag: "mobile",
    body: "Make a first mobile app and run it on a real Android device — from idea to something that taps and works.",
    accent: "brand",
  },
  {
    no: "08",
    title: "AI Assisted Tools",
    tag: "ai",
    body: "Use AI tools to create, learn and solve problems — and talk through using technology kindly and fairly.",
    accent: "coral",
  },
];

export const tiers: { name: string; age: string; focus: string; note: string; accent: Accent }[] = [
  {
    name: "Juniors",
    age: "Ages 7–9",
    focus: "Scratch & creative coding",
    note: "Zero experience needed — if they can read, they can build.",
    accent: "coral",
  },
  {
    name: "Explorers",
    age: "Ages 10–12",
    focus: "Web & game design",
    note: "For curious beginners ready to type their first real code.",
    accent: "blue",
  },
  {
    name: "Builders",
    age: "Ages 13–15",
    focus: "Python, robotics & AI",
    note: "Comfortable on a keyboard and hungry for a proper challenge.",
    accent: "brand",
  },
];

// The two intakes from the flyer. Durations and start dates are exact; the blurbs
// are descriptive (the flyer doesn't map specific courses to a track).
export const tracks: { name: string; duration: string; start: string; blurb: string; accent: Accent }[] = [
  {
    name: "Marvel Track",
    duration: "1 Month",
    start: "Starts 1 August 2026",
    blurb: "The fast track — one focused month of hands-on coding, design and creative builds.",
    accent: "coral",
  },
  {
    name: "Genius Track",
    duration: "2 Months",
    start: "Starts 1 July 2026",
    blurb: "The deep dive — two months to move from the basics all the way to building real projects.",
    accent: "blue",
  },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: "Does my child need any coding experience?",
    a: "None at all. Total beginners are welcome, and we group children by age and pace so everyone is challenged at the right level.",
  },
  {
    q: "What should they bring?",
    a: "Just curiosity and a water bottle. We provide laptops, robots, all materials, and a daily snack. Lunch is included.",
  },
  {
    q: "How big are the groups?",
    a: "Small on purpose — never more than eight children per coach, so every kid gets real attention and keyboard time.",
  },
  {
    q: "Is the venue safe and supervised?",
    a: "Yes. Coaches are vetted, children are supervised throughout, and we run a parent check-in and check-out at the door each day.",
  },
  {
    q: "What does my child go home with?",
    a: "A certificate, every project they built during the week, and a digital attendance badge they can generate and share right here.",
  },
  {
    q: "How do we register and pay?",
    a: "Reserve a seat online and our team confirms your spot by email with payment details. Seats are limited to 40 children.",
  },
];

export const footerLinks = [
  { label: "About the camp", href: "#about" },
  { label: "What they learn", href: "#learn" },
  { label: "Who it's for", href: "#who" },
  { label: "Tracks", href: "#tracks" },
  { label: "FAQs", href: "#faq" },
];
