// Isolated mock dataset. This is the ONLY place that fabricates program,
// template, and generation data. Nothing here leaks into UI components.

import type { Generation, Program } from "@/shared/types/domain";

const svg = (inner: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">${inner}</svg>`,
  )}`;

const templatePreview = (label: string, from: string, to: string) =>
  svg(`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="800" height="800" fill="${from}"/>
    <path d="M0 520c180-40 360 40 540 0 90-20 170-6 260-44V800H0Z" fill="url(#g)" opacity=".9"/>
    <circle cx="400" cy="320" r="170" fill="#dbeafe" stroke="white" stroke-width="16"/>
    <circle cx="400" cy="290" r="60" fill="#93c5fd"/><path d="M290 450c20-90 200-90 220 0" fill="#93c5fd"/>
    <circle cx="400" cy="320" r="182" fill="none" stroke="#FAA61A" stroke-width="5"/>
    <text x="48" y="64" font-family="Arial" font-size="26" font-weight="800" fill="#ffffff">DIGITAL DREAMS</text>
    <text x="400" y="640" text-anchor="middle" font-family="Arial" font-size="30" font-weight="800" fill="#ffffff">${label}</text>`);

const banner = (title: string, from: string, to: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="420" viewBox="0 0 1200 420">
      <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
      <rect width="1200" height="420" fill="url(#b)"/>
      <circle cx="1080" cy="60" r="220" fill="#ffffff" opacity=".08"/>
      <circle cx="120" cy="400" r="180" fill="#FAA61A" opacity=".18"/>
      <text x="64" y="220" font-family="Arial" font-size="56" font-weight="800" fill="#ffffff">${title}</text>
    </svg>`,
  )}`;

const sampleAttendanceCard = (name: string, programName: string, dateLabel: string) =>
  svg(`<defs>
      <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#071b33"/><stop offset=".58" stop-color="#0b2f4f"/><stop offset="1" stop-color="#159568"/>
      </linearGradient>
      <linearGradient id="photoBg" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#e8fff0"/><stop offset="1" stop-color="#c8f7db"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#031526" flood-opacity=".35"/>
      </filter>
    </defs>
    <rect width="800" height="800" rx="0" fill="#f8fbf7"/>
    <rect x="42" y="42" width="716" height="716" rx="44" fill="url(#cardBg)" filter="url(#shadow)"/>
    <circle cx="704" cy="96" r="150" fill="#ffffff" opacity=".08"/>
    <circle cx="96" cy="704" r="180" fill="#19b56c" opacity=".13"/>
    <path d="M42 568c148-38 267 32 412-6 118-31 197-8 304-64v260H42Z" fill="#19b56c" opacity=".32"/>

    <text x="82" y="105" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="#ffffff">DIGITAL DREAMS ICT ACADEMY</text>
    <rect x="82" y="128" width="178" height="34" rx="17" fill="#ffffff"/>
    <text x="171" y="151" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="800" fill="#128d55">PROGRAM ATTENDANCE</text>

    <rect x="206" y="190" width="388" height="388" rx="194" fill="#ffffff" opacity=".22"/>
    <rect x="225" y="209" width="350" height="350" rx="175" fill="#ffffff"/>
    <circle cx="400" cy="384" r="156" fill="url(#photoBg)"/>
    <circle cx="400" cy="337" r="54" fill="#159568" opacity=".9"/>
    <path d="M294 487c18-78 194-78 212 0" fill="#159568" opacity=".9"/>
    <circle cx="400" cy="384" r="166" fill="none" stroke="#FAA61A" stroke-width="8"/>

    <text x="400" y="638" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="900" letter-spacing="5" fill="#a7f3c2">I AM ATTENDING</text>
    <text x="400" y="685" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="900" fill="#ffffff">${name}</text>
    <text x="400" y="724" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#e7fff0">${programName}</text>
    <text x="400" y="751" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#ffffff" opacity=".86">${dateLabel}</text>

    <rect x="592" y="78" width="100" height="100" rx="18" fill="#ffffff"/>
    <rect x="609" y="95" width="20" height="20" fill="#071b33"/>
    <rect x="641" y="95" width="12" height="12" fill="#159568"/>
    <rect x="665" y="95" width="10" height="34" fill="#071b33"/>
    <rect x="609" y="129" width="14" height="30" fill="#159568"/>
    <rect x="637" y="123" width="20" height="20" fill="#071b33"/>
    <rect x="665" y="145" width="10" height="14" fill="#159568"/>
    <text x="642" y="199" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="800" fill="#a7f3c2">SHARE CARD</text>`);

const now = () => new Date().toISOString();

export const seedPrograms: Program[] = [
  {
    id: "prog_001",
    title: "Digital Dreams Tech Bootcamp 2026",
    slug: "digital-dreams-tech-bootcamp-2026",
    description: "An intensive, practical technology program built around learning, collaboration, and real projects.",
    startDate: "2026-07-20",
    endDate: "2026-07-24",
    bannerUrl: banner("Tech Bootcamp 2026", "#4267b2", "#159568"),
    status: "active",
    attendanceText: "{{name}} is attending {{programName}}",
    generationCount: 128,
    createdAt: "2026-05-01T09:00:00Z",
    templates: [
      { id: "temp_001", programId: "prog_001", name: "Classic", previewUrl: templatePreview("CLASSIC", "#4267b2", "#159568"), type: "image", status: "active", isDefault: true },
      { id: "temp_002", programId: "prog_001", name: "Minimal", previewUrl: templatePreview("MINIMAL", "#172b4d", "#159568"), type: "image", status: "active" },
      { id: "temp_005", programId: "prog_001", name: "Digital Dreams Signature", previewUrl: sampleAttendanceCard("Your Name", "Tech Bootcamp 2026", "July 20 - 24, 2026"), type: "image", status: "active" },
    ],
  },
  {
    id: "prog_002",
    title: "LinkSkool Educators Summit",
    slug: "linkskool-educators-summit",
    description: "A gathering of forward-thinking educators exploring the future of digital learning.",
    startDate: "2026-09-10",
    endDate: "2026-09-11",
    bannerUrl: banner("Educators Summit", "#7c3aed", "#159568"),
    status: "active",
    attendanceText: "{{name}} will be attending {{programName}}",
    generationCount: 42,
    createdAt: "2026-05-18T11:30:00Z",
    templates: [
      { id: "temp_003", programId: "prog_002", name: "Summit Badge", previewUrl: templatePreview("REGISTERED", "#7c3aed", "#159568"), type: "image", status: "active", isDefault: true },
    ],
  },
  {
    id: "prog_003",
    title: "Enugu Innovation Week",
    slug: "enugu-innovation-week",
    description: "A week celebrating innovators, makers, and startups across the South-East.",
    startDate: "2026-11-03",
    endDate: "2026-11-07",
    bannerUrl: banner("Innovation Week", "#0f766e", "#4267b2"),
    status: "draft",
    attendanceText: "{{name}} is joining {{programName}}",
    generationCount: 0,
    createdAt: "2026-06-02T08:15:00Z",
    templates: [],
  },
  {
    id: "prog_004",
    title: "Digital Dreams Alumni Reunion 2025",
    slug: "digital-dreams-alumni-reunion-2025",
    description: "Reconnecting our community of graduates and mentors.",
    startDate: "2025-12-20",
    endDate: "2025-12-20",
    bannerUrl: banner("Alumni Reunion", "#475569", "#4267b2"),
    status: "archived",
    attendanceText: "{{name}} attended {{programName}}",
    generationCount: 311,
    createdAt: "2025-10-01T08:15:00Z",
    templates: [
      { id: "temp_004", programId: "prog_004", name: "Reunion Frame", previewUrl: templatePreview("PROUD ALUMNI", "#475569", "#4267b2"), type: "image", status: "archived", isDefault: true },
    ],
  },
];

export const seedGenerations: Generation[] = [
  {
    id: "gen_123",
    programId: "prog_001",
    programTitle: "Digital Dreams Tech Bootcamp 2026",
    templateId: "temp_005",
    templateName: "Digital Dreams Signature",
    participantName: "Adaeze Okafor",
    generatedAt: "2026-06-18T09:00:00Z",
    pdfUrl: "#",
    imageUrl: sampleAttendanceCard("Adaeze Okafor", "Digital Dreams Tech Bootcamp 2026", "July 20 - 24, 2026"),
    expiresAt: "2026-07-30T00:00:00Z",
  },
  { id: "gen_001", programId: "prog_001", programTitle: "Digital Dreams Tech Bootcamp 2026", templateId: "temp_001", templateName: "Default Attendance Card", participantName: "Jerry George", generatedAt: "2026-06-15T10:24:00Z", pdfUrl: "#", imageUrl: "#", expiresAt: "2026-07-30T00:00:00Z" },
  { id: "gen_002", programId: "prog_001", programTitle: "Digital Dreams Tech Bootcamp 2026", templateId: "temp_002", templateName: "Minimal Card", participantName: "Amaka Obi", generatedAt: "2026-06-16T14:02:00Z", pdfUrl: "#", imageUrl: "#", expiresAt: "2026-07-30T00:00:00Z" },
  { id: "gen_003", programId: "prog_002", programTitle: "LinkSkool Educators Summit", templateId: "temp_003", templateName: "Summit Badge", participantName: "Tunde Bakare", generatedAt: "2026-06-17T08:41:00Z", pdfUrl: "#", imageUrl: "#", expiresAt: "2026-09-20T00:00:00Z" },
  { id: "gen_004", programId: "prog_001", programTitle: "Digital Dreams Tech Bootcamp 2026", templateId: "temp_001", templateName: "Default Attendance Card", participantName: "Chidinma Eze", generatedAt: "2026-06-17T16:55:00Z", pdfUrl: "#", imageUrl: "#", expiresAt: "2026-07-30T00:00:00Z" },
];

export const mockHelpers = { now, templatePreview };
