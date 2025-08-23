export interface Language {
  code: 'en' | 'ar';
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    dir: 'ltr'
  },
  {
    code: 'ar',
    name: 'العربية',
    flag: '🇹🇳',
    dir: 'rtl'
  }
];

export const translations = {
  en: {
    // Navigation and Common
    languageSwitcher: 'Switch Language',
    
    // Hero Section
    heroTitle: 'Louaj',
    heroSubtitle: 'Public Transportation Management System',
    heroDescription: 'The future of transportation is here. Connect, travel, and transform how Tunisia moves with our intelligent network.',
    downloadApp: 'Download App',
    bookOnline: 'Book Online',
    joinPassenger: 'Join as Passenger',
    stationPartnership: 'Station Partnership',
    
    // Features Section
    featuresTitle: 'Why Choose Louaj?',
    featuresSubtitle: 'Revolutionary features that redefine transportation',
    
    feature1Title: 'Online Booking',
    feature1Description: 'Book your tickets seamlessly online with real-time availability and instant confirmation.',
    
    feature2Title: 'Station Network',
    feature2Description: 'Stations can join our network after approval, expanding coverage across Tunisia.',
    
    feature3Title: 'Smart Management',
    feature3Description: 'Advanced route optimization and real-time tracking for efficient transportation.',
    
    // Routes Table
    routesTitle: 'Routes & Pricing',
    routesSubtitle: 'Explore our extensive network of routes across Tunisia',
    departureStation: 'Departure Station',
    destinationStation: 'Destination Station',
    price: 'Price',
    currency: 'TND',
    
    // Interactive Map
    mapTitle: 'Interactive Route Map',
    mapSubtitle: 'Discover our network of stations and routes across Tunisia',
    
    // Station Status
    stationOnline: 'Online',
    stationOffline: 'Offline',
    
    // Buttons
    bookNow: 'Book Now',
    viewRoute: 'View Route',
    learnMore: 'Learn More',
    
    // Footer
    allRightsReserved: 'All rights reserved.',
    
    // Loading
    loading: 'Loading...',
    loadingRoutes: 'Loading routes...',
    
    // Error
    errorLoadingRoutes: 'Error loading routes',
    tryAgain: 'Try Again'
  },
  ar: {
    // Navigation and Common
    languageSwitcher: 'تغيير اللغة',
    
    // Hero Section
    heroTitle: 'لواج',
    heroSubtitle: 'نظام إدارة النقل العمومي',
    heroDescription: 'مستقبل النقل هنا. اتصل، سافر، وغيّر طريقة تنقل تونس مع شبكتنا الذكية.',
    downloadApp: 'تحميل التطبيق',
    bookOnline: 'احجز عبر الإنترنت',
    joinPassenger: 'انضم كمسافر',
    stationPartnership: 'شراكة المحطة',
    
    // Features Section
    featuresTitle: 'ليش تختار لواج؟',
    featuresSubtitle: 'ميزات ثورية تعيد تعريف النقل',
    
    feature1Title: 'الحجز عبر الإنترنت',
    feature1Description: 'احجز تذاكرك بسهولة عبر الإنترنت مع التوفر في الوقت الفعلي والتأكيد الفوري.',
    
    feature2Title: 'شبكة المحطات',
    feature2Description: 'يمكن للمحطات الانضمام إلى شبكتنا بعد الموافقة، مما يوسع التغطية في جميع أنحاء تونس.',
    
    feature3Title: 'الإدارة الذكية',
    feature3Description: 'تحسين متقدم للطرق وتتبع في الوقت الفعلي للنقل الفعال.',
    
    // Routes Table
    routesTitle: 'الطرق والأسعار',
    routesSubtitle: 'استكشف شبكتنا الواسعة من الطرق في جميع أنحاء تونس',
    departureStation: 'محطة المغادرة',
    destinationStation: 'محطة الوصول',
    price: 'السعر',
    currency: 'د.ت',
    
    // Interactive Map
    mapTitle: 'خريطة الطرق التفاعلية',
    mapSubtitle: 'اكتشف شبكة محطاتنا وطرقنا في جميع أنحاء تونس',
    
    // Station Status
    stationOnline: 'متصل',
    stationOffline: 'غير متصل',
    
    // Buttons
    bookNow: 'احجز الآن',
    viewRoute: 'عرض الطريق',
    learnMore: 'تعرف أكثر',
    
    // Footer
    allRightsReserved: 'جميع الحقوق محفوظة.',
    
    // Loading
    loading: 'جاري التحميل...',
    loadingRoutes: 'جاري تحميل الطرق...',
    
    // Error
    errorLoadingRoutes: 'خطأ في تحميل الطرق',
    tryAgain: 'حاول مرة أخرى'
  }
};

export type TranslationKey = keyof typeof translations.en;