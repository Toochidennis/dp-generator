import { event, faqs, modules } from "@/public/data/event";
import { absoluteUrl, type JsonLd } from "@/shared/utils/seo";

const DEFAULT_IMAGE = "/digital-dreams-logo.png";

export const bootcampSeoDefaults = {
  siteName: `${event.name} ${event.year}`,
  image: DEFAULT_IMAGE,
  imageAlt: `${event.brand} ${event.name} logo`,
};

export const landingSeo = {
  title: `${event.name} ${event.year} | ${event.brand} Academy`,
  description:
    "Register kids ages 7-15 for Digital Dreams Kids Coding Bootcamp in Enugu or online. Learn Scratch, web development, Python, robotics, Android, AI and design.",
};

export const badgeSeo = {
  title: `Generate Your ${event.name} Badge | ${event.brand}`,
  description:
    "Create and download a personalized 'I'm Attending' badge for the Digital Dreams Kids Coding Bootcamp 2026.",
};

export function landingStructuredData(): JsonLd[] {
  const courseNames = modules.map((module) => module.title);

  return [
    {
      "@context": "https://schema.org",
      "@type": "EducationEvent",
      name: `${event.name} ${event.year}`,
      description: landingSeo.description,
      startDate: event.startISO,
      eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: event.venue,
        address: {
          "@type": "PostalAddress",
          streetAddress: event.venueAddress,
          addressLocality: "Enugu",
          addressCountry: "NG",
        },
      },
      organizer: {
        "@type": "EducationalOrganization",
        name: event.brand,
        url: absoluteUrl("/"),
        telephone: event.phone,
      },
      offers: {
        "@type": "Offer",
        price: "60000",
        priceCurrency: "NGN",
        availability: "https://schema.org/LimitedAvailability",
        url: event.registerUrl,
      },
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
        audienceType: event.ageLabel,
      },
      url: absoluteUrl("/"),
      image: absoluteUrl(DEFAULT_IMAGE),
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: `${event.name} ${event.year}`,
      description: event.blurb,
      provider: {
        "@type": "EducationalOrganization",
        name: event.brand,
        sameAs: `https://instagram.com/${event.social}`,
      },
      teaches: courseNames,
      educationalCredentialAwarded: "Certificate of completion",
      audience: {
        "@type": "EducationalAudience",
        audienceType: event.ageLabel,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ];
}

export function badgeStructuredData(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${event.name} Badge Generator`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    description: badgeSeo.description,
    url: absoluteUrl("/badge"),
    publisher: {
      "@type": "EducationalOrganization",
      name: event.brand,
    },
  };
}
