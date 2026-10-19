export const locales = ["en", "hi"] as const;
export type Locale = (typeof locales)[number];

export const dictionaries = {
  en: {
    nav: {
      home: "Home",
      agri: "Agri Services",
      health: "Health Services",
      myBookings: "My Bookings",
      sos: "SOS 108",
      login: "Log In",
      signup: "Sign Up",
      logout: "Log Out",
      dashboard: "Dashboard",
    },
    home: {
      title: "Welcome to Kheti Sehat",
      subtitle:
        "Find trusted agri and health service providers near you. Verified providers, fair prices, easy bookings — your reliable friend in the field.",
      badgeVerified: "Verified Providers",
      badgeAyushman: "Ayushman Bharat Support",
      tabAgri: "Agri Services / कृषि सेवाएं",
      tabHealth: "Health Services / स्वास्थ्य सेवाएं",
    },
    common: {
      category: "Category",
      location: "Location",
      search: "Search",
      allCategories: "All Categories",
      requestService: "Request Service",
      callNow: "Call Now",
      viewDetails: "View Details",
      rateProvider: "Rate Provider",
      loading: "Loading…",
    },
  },
  hi: {
    nav: {
      home: "होम",
      agri: "कृषि सेवाएं",
      health: "स्वास्थ्य सेवाएं",
      myBookings: "मेरी बुकिंग",
      sos: "SOS 108",
      login: "लॉग इन",
      signup: "पंजीकरण",
      logout: "लॉग आउट",
      dashboard: "डैशबोर्ड",
    },
    home: {
      title: "खेती सेहत में आपका स्वागत है",
      subtitle:
        "अपने नज़दीक विश्वसनीय कृषि और स्वास्थ्य सेवा प्रदाता खोजें। सत्यापित प्रदाता, उचित मूल्य, आसान बुकिंग।",
      badgeVerified: "सत्यापित प्रदाता",
      badgeAyushman: "आयुष्मान भारत सहायता",
      tabAgri: "कृषि सेवाएं / Agri Services",
      tabHealth: "स्वास्थ्य सेवाएं / Health Services",
    },
    common: {
      category: "श्रेणी",
      location: "स्थान",
      search: "खोजें",
      allCategories: "सभी श्रेणियां",
      requestService: "सेवा का अनुरोध करें",
      callNow: "अभी कॉल करें",
      viewDetails: "विवरण देखें",
      rateProvider: "रेटिंग दें",
      loading: "लोड हो रहा है…",
    },
  },
} as const satisfies Record<Locale, unknown>;

export type Dictionary = (typeof dictionaries)["en"];
