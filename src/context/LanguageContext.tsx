import React, { createContext, useContext, useState, useEffect } from 'react';
import { Globe, Languages } from 'lucide-react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Common
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.academics': 'Academics & Courses',
    'nav.facilities': 'Facilities',
    'nav.gallery': 'Gallery',
    'nav.notices': 'Notices',
    'nav.contact': 'Contact Us',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    'nav.apply_online': 'Apply Online',
    'nav.tagline': 'Online & Offline Coaching • Computer Classes',

    // Hero & Welcome
    'hero.badge': 'Online Live & Offline Classroom Batches',
    'hero.welcome_title': 'Suryoday Study Point',
    'hero.welcome_p1': 'Welcome to Suryoday Study Point, located at Bhawani Chhapar Bajar (Near Sirisiya Babu Road), Deoria, Uttar Pradesh. We offer academic coaching for Class 6th to 12th (CBSE & UP Board), Evening Batches, Competitive Exam Preparation (Suryoday Competition Classes), and Computer Training Courses (CCC, ADCA, DCA, Tally).',
    'hero.welcome_p2': 'Students can choose between interactive Offline Physical Classroom Batches at our Bhawani Chhapar center or Online Live Interactive Classes with recorded video lectures, Daily Practice Papers (DPPs), and computer lab practice.',
    'hero.badge_evening': 'Evening Batches',
    'hero.badge_competition': 'Competition Classes',
    'hero.badge_computer': 'Computer Lab',
    'hero.badge_online': 'Online Live Portal',
    'hero.btn_enroll': 'Enroll for Batches',
    'hero.btn_courses': 'View Courses & Syllabus',

    // Features / Why Choose Us
    'why.title': 'Our Core Advantages',
    'why.badge': 'Why Choose Suryoday Study Point',
    'why.f1_title': 'Dual Learning (Online + Offline)',
    'why.f1_desc': 'Option to attend physical classroom batches at campus or join HD Live Online Classes with recorded lectures.',
    'why.f2_title': 'Experienced Expert Faculties',
    'why.f2_desc': 'Renowned subject experts for Physics, Chemistry, Math, Biology, Commerce & Arts with proven track records.',
    'why.f3_title': 'DPPs & Updated Study Material',
    'why.f3_desc': 'Chapter-wise Daily Practice Papers (DPPs), printed booklets, formula books, and digital PDFs on student portal.',
    'why.f4_title': 'Weekly Mock Tests & Speed Practice',
    'why.f4_desc': 'Regular CBT (Computer Based) & OMR test series with detailed rank, accuracy, and performance analytics.',
    'why.f5_title': '24/7 Doubt Resolution',
    'why.f5_desc': 'Dedicated offline doubt clearing counters after class and online instant doubt assistance through student portal.',
    'why.f6_title': 'Affordable & Quality Focus',
    'why.f6_desc': 'Top-tier coaching made accessible to all students with merit-based scholarships and student support.',

    // Programs / Offerings
    'prog.badge': 'Courses & Batches',
    'prog.title': 'Suryoday Coaching Programs',
    'prog.p1_title': 'School Academics (6th-12th)',
    'prog.p1_sub': 'CBSE & UP Board (Evening Batches)',
    'prog.p1_desc': 'Comprehensive coaching for Class 6th to 12th with evening batch convenience, expert subject teachers & test series.',
    'prog.p2_title': 'Suryoday Competition Classes',
    'prog.p2_sub': 'SSC / UP Police / Railway / Army',
    'prog.p2_desc': 'Dedicated competitive exam prep with daily practice questions, speed math, reasoning, GK & previous paper practice.',
    'prog.p3_title': 'Suryoday Computer Classes',
    'prog.p3_sub': 'CCC / ADCA / DCA / Tally',
    'prog.p3_desc': 'Practical hands-on computer training in CCC government certification, ADCA diploma, Tally accounting & programming.',
    'prog.p4_title': 'Target JEE / NEET / Board',
    'prog.p4_sub': 'Entrance & Board Special',
    'prog.p4_desc': 'In-depth Physics, Chemistry, Mathematics & Biology numerical problem solving with Daily Practice Papers (DPPs).',

    // Stats
    'stats.s1_num': '3,500+',
    'stats.s1_label': 'Students Enrolled',
    'stats.s2_num': '99.2%',
    'stats.s2_label': 'Board Pass Rate',
    'stats.s3_num': '450+',
    'stats.s3_label': 'Selections & Certificates',
    'stats.s4_num': '10+',
    'stats.s4_label': 'Years of Trust',

    // Director Message
    'director.title': "Director's Message",
    'director.name': 'Er. Alok Kumar',
    'director.sub': 'Founder & Director, Suryoday Study Point',
    'director.quote': 'At Suryoday Study Point, our goal is to illuminate the path to success for every student through personalized attention, conceptual clarity, and modern digital learning tools. Whether you study in our offline classrooms or through our live online portal, we ensure top-quality education, daily problem solving, and constant mentorship to help you conquer board and competitive exams.',

    // CTA
    'cta.title_open': 'Ready to Excel in Board & Competitive Exams?',
    'cta.sub_open': 'Batch enrollments are now open for academic session. Join Suryoday Study Point in Online Live Mode or Offline Classroom Mode for Class 6th to 12th, Evening Batches, Competition & Computer Classes.',
    'cta.btn_apply': 'Apply Online Now',
    'cta.btn_contact': 'Contact Us',

    // Footer
    'footer.quick_links': 'Quick Navigation',
    'footer.portals': 'Student & Parent Portals',
    'footer.contact': 'Contact Details',
    'footer.rights': 'All Rights Reserved.',

    // Contact
    'contact.title': 'Contact Us',
    'contact.desc': "We're here to help and answer any question you might have. We look forward to hearing from you.",
    'contact.get_in_touch': 'Get In Touch',
    'contact.location': 'Our Location',
    'contact.phone': 'Phone Number',
    'contact.email': 'Email Address',
    'contact.hours_label': 'Counseling & Office Hours',
    'contact.send_message': 'Send us a Message',
    'contact.map_title': 'Find Us on the Map',
    'contact.address': 'Bhawani Chhapar Bajar (Near Sirisiya Babu Road), Deoria, Uttar Pradesh - 274702',
    'contact.hours': 'Counseling Hours: Mon - Sat: 7:00 AM - 7:00 PM',

    // About Page
    'about.title': 'About Us',
    'about.subtitle': 'Empowering students with top-tier Online & Offline coaching since 2016.',
    'about.p1': 'Suryoday Study Point (also known as Suryoday Coaching, Suryoday Competition Classes & Computer Classes) is located at Bhawani Chhapar Bajar (Near Sirisiya Babu Road), Deoria district, Uttar Pradesh.',
    'about.p2': 'We provide high-quality Academic Coaching for Class 6th to 12th (CBSE & UP State Board) with convenient Evening Batches, along with dedicated Competitive Exam Preparation (Suryoday Competition Classes - SSC, UP Police, Army, Railway, UP TGT/PGT) and Government Certified Computer Classes (CCC, ADCA, DCA, Tally).',
    'about.p3': 'We offer dual-mode study options: interactive Offline Physical Classroom Batches at our Bhawani Chhapar campus and Online HD Live Stream Classes with recorded video lectures, Daily Practice Papers (DPPs), and computer lab practice.',
    'about.quote': '"Every sunrise brings new possibilities. At Suryoday Study Point, we wake up every morning driven to guide our students toward academic excellence and bright future careers."',
    'about.mission_title': 'Our Mission',
    'about.mission_desc': 'To make quality coaching education accessible and affordable for every student through interactive live online classes and disciplined offline classrooms.',
    'about.vision_title': 'Our Vision',
    'about.vision_desc': 'To produce board toppers, engineers, doctors, and competitive leaders who possess critical thinking, problem-solving abilities, and strong ethics.',
    'about.highlights': 'Institute Highlights',

    // Academics Page
    'academics.title': 'Suryoday Study Point Courses',
    'academics.sub': 'Academic Programs & Batches',
    'academics.desc': 'We offer comprehensive Coaching Batches in both Online Live Mode and Offline Classroom Mode with daily practice, test series, and expert faculty support.',
    'academics.mode_title': 'Select Mode of Study',
    'academics.mode_desc': 'Filter courses by Online Live or Offline Classroom',
    'academics.all_batches': 'All Batches',
    'academics.online_batches': 'Online Batches',
    'academics.offline_batches': 'Offline Batches',

    // Facilities Page
    'facilities.badge': 'Modern Infrastructure',
    'facilities.title': 'Suryoday Coaching Facilities',
    'facilities.desc': 'Equipped with cutting-edge technology for online streaming as well as high-comfort classrooms for offline physical batches.',
    'facilities.f1_title': 'HD Studio for Online Streaming',
    'facilities.f1_desc': 'High-definition camera setups, smart interactive panels, and noise-isolated acoustic studios for smooth live lectures.',
    'facilities.f2_title': 'Smart AC Classrooms',
    'facilities.f2_desc': 'Climate-controlled, comfortable seating with interactive digital boards for visual diagrammatic explanations.',
    'facilities.f3_title': 'Computer-Based Test (CBT) Lab',
    'facilities.f3_desc': 'Dedicated computer lab with JEE / NEET mock test software simulating actual NTA national exam environments.',
    'facilities.f4_title': 'Library & Silent Self-Study Hall',
    'facilities.f4_desc': 'Extensive collection of reference books, HC Verma, Irodov, NCERT exemplar books, and peaceful study desks.',
    'facilities.f5_title': 'Dedicated Offline Doubt Desks',
    'facilities.f5_desc': 'Special doubt clearing counters available before and after regular batches for 1-on-1 problem resolution with faculties.',
    'facilities.f6_title': 'Study Material & DPP Distribution Center',
    'facilities.f6_desc': 'In-house module printing and distribution desk providing comprehensive printed booklets and daily practice papers.',

    // Admissions Page
    'admissions.title': 'Online Admissions',
    'admissions.closed': 'Admissions Closed',
    'admissions.criteria': 'Admission Criteria & Instructions',
    'admissions.docs': 'Documents to be Submitted',

    // Gallery Page
    'gallery.title': 'Our Gallery',
    'gallery.desc': 'Take a visual journey through our state-of-the-art facilities, vibrant events, and the daily life of our students.',
    'gallery.tour': 'Want to see more?',
    'gallery.book_tour': 'Book a Campus Tour',

    // Notices Page
    'notices.title': 'Notice Board & Circulars',
    'notices.desc': 'Official announcements, exam timetables, event circulars, and updates for students, parents, and staff.',
    'notices.search': 'Search notices by keyword, title, or circular details...',

    // Language Toggle Label
    'lang.current': 'English',
    'lang.switch': 'हिंदी में देखें',

    // Auth & Login
    'auth.login_title': 'User & Student Login',
    'auth.login_subtitle': 'Access Suryoday Study Point Student Portal, Live Classes & Notes',
    'auth.login_id_label': 'Mobile Number / Email / Student ID',
    'auth.login_id_placeholder': 'Enter 10-digit Mobile or Email ID',
    'auth.password_label': 'Password',
    'auth.password_placeholder': 'Enter your password',
    'auth.remember_me': 'Remember Me',
    'auth.forgot_password': 'Lost Password?',
    'auth.btn_sign_in': 'Sign In to Portal',
    'auth.authenticating': 'Authenticating...',
    'auth.no_account': "Don't have a student account?",
    'auth.btn_create_account': 'Create New Student Account',
    'auth.reg_title': 'New Student Registration',
    'auth.reg_subtitle': 'Create your personal Suryoday Study Point ID',
    'auth.reg_student_info': 'Student Details',
    'auth.full_name': 'Student Full Name',
    'auth.full_name_placeholder': 'e.g. Rahul Kumar',
    'auth.select_course': 'Course / Stream Category',
    'auth.course_academic': 'School Academic (Class 6th to 12th)',
    'auth.course_competition': 'Suryoday Competition Classes (SSC/Police/Railway)',
    'auth.course_computer': 'Suryoday Computer Classes (CCC/ADCA/Tally)',
    'auth.mobile_number': 'Mobile Number (10 Digits)',
    'auth.mobile_placeholder': 'e.g. 9876543210',
    'auth.email_address': 'Email Address',
    'auth.email_placeholder': 'e.g. student@example.com',
    'auth.create_password': 'Create Password',
    'auth.password_min_placeholder': 'Min. 6 characters',
    'auth.btn_register': 'Register Student Account',
    'auth.creating_account': 'Creating Student Account...',
    'auth.btn_back_login': 'Back to Sign In',
    'auth.reset_title': 'Reset Password',
    'auth.reset_sub': 'Enter your registered email address and we will send you a reset link.',
    'auth.reset_email_label': 'Email Address',
    'auth.reset_email_placeholder': 'Enter email address',
    'auth.cancel': 'Cancel',
    'auth.send_reset_link': 'Send Reset Link'
  },
  hi: {
    // Nav & Common
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.academics': 'कोर्सेज और बैचेज',
    'nav.facilities': 'सुविधाएं',
    'nav.gallery': 'गैलरी',
    'nav.notices': 'सूचनाएं',
    'nav.contact': 'संपर्क करें',
    'nav.login': 'साइन इन',
    'nav.logout': 'साइन आउट',
    'nav.apply_online': 'ऑनलाइन प्रवेश लें',
    'nav.tagline': 'ऑनलाइन एवं ऑफलाइन कोचिंग • कंप्यूटर क्लास',

    // Hero & Welcome
    'hero.badge': 'ऑनलाइन लाइव और ऑफलाइन क्लासरूम बैचेज',
    'hero.welcome_title': 'सूर्योदय स्टडी प्वाइंट',
    'hero.welcome_p1': 'सूर्योदय स्टडी प्वाइंट में आपका स्वागत है, जो भवानी छपार बाजार (सिरिसिया बाबू रोड के पास), देवरिया, उत्तर प्रदेश में स्थित है। हम कक्षा 6वीं से 12वीं (CBSE एवं UP बोर्ड), शाम के विशेष बैच, प्रतियोगी परीक्षा तैयारी (सूर्योदय कॉम्पिटिशन क्लासेस) तथा कंप्यूटर प्रशिक्षण (CCC, ADCA, DCA, Tally) प्रदान करते हैं।',
    'hero.welcome_p2': 'छात्र भवानी छपार केंद्र पर ऑफलाइन क्लासरूम बैच में शामिल हो सकते हैं या मोबाइल/लैपटॉप के माध्यम से ऑनलाइन लाइव एवं रिकॉर्डेड क्लासेस, Daily Practice Papers (DPPs) और ऑनलाइन मॉक टेस्ट का लाभ उठा सकते हैं।',
    'hero.badge_evening': 'शाम के स्पेशल बैचेज',
    'hero.badge_competition': 'प्रतियोगी परीक्षा',
    'hero.badge_computer': 'कंप्यूटर लैब',
    'hero.badge_online': 'ऑनलाइन लाइव पोर्टल',
    'hero.btn_enroll': 'बैच में प्रवेश लें',
    'hero.btn_courses': 'कोर्सेज और सिलेबस देखें',

    // Features / Why Choose Us
    'why.title': 'हमारी प्रमुख विशेषताएं',
    'why.badge': 'सूर्योदय स्टडी प्वाइंट क्यों चुनें',
    'why.f1_title': 'ऑनलाइन + ऑफलाइन दोनों विकल्प',
    'why.f1_desc': 'कैंपस में ऑफलाइन क्लासरूम में पढ़ें या घर बैठे HD ऑनलाइन लाइव क्लास और रिकॉर्डेड वीडियो लेक्चर्स से तैयारी करें।',
    'why.f2_title': 'अनुभवी एवं विशेषज्ञ शिक्षक',
    'why.f2_desc': 'भौतिकी, रसायन, गणित, जीव विज्ञान, वाणिज्य, कला, कंप्यूटर एवं प्रतियोगी परीक्षाओं के लिए अनुभवी शिक्षकों की टीम।',
    'why.f3_title': 'DPPs एवं अपडेटेड स्टडी मटीरियल',
    'why.f3_desc': 'अध्यायवार Daily Practice Papers (DPPs), प्रिंटेड बुकलेट्स, फॉर्मूला बुक और ऑनलाइन पोर्टल पर डिजिटल नोट्स।',
    'why.f4_title': 'साप्ताहिक मॉक टेस्ट और स्पीड प्रैक्टिस',
    'why.f4_desc': 'कंप्यूटर आधारित (CBT) एवं OMR टेस्ट सीरीज के माध्यम से विस्तृत अंक, रैंक एवं समय प्रबंधन का विश्लेषण।',
    'why.f5_title': '24/7 डाउट समाधान व्यवस्था',
    'why.f5_desc': 'क्लास के बाद विशेष ऑफलाइन डाउट काउंटर्स और ऑनलाइन पोर्टल पर तुरंत शंका निवारण की सुविधा।',
    'why.f6_title': 'किफायती एवं गुणवत्तापूर्ण शिक्षा',
    'why.f6_desc': 'उत्कृष्ट शैक्षणिक सुविधाएं हर छात्र के लिए सुलभ और कम फीस में उपलब्ध।',

    // Programs / Offerings
    'prog.badge': 'कोर्सेज एवं बैचेज',
    'prog.title': 'सूर्योदय कोचिंग प्रोग्राम्स',
    'prog.p1_title': 'स्कूली शिक्षा (कक्षा 6वीं से 12वीं)',
    'prog.p1_sub': 'CBSE एवं UP बोर्ड (शाम के बैचेज)',
    'prog.p1_desc': 'स्कूल जाने वाले छात्रों के लिए शाम के समय सुविधाजनक बैचेज, विषयवार विशेषज्ञ मार्गदर्शन एवं परीक्षा की संपूर्ण तैयारी।',
    'prog.p2_title': 'सूर्योदय कॉम्पिटिशन क्लासेस',
    'prog.p2_sub': 'SSC / यूपी पुलिस / रेलवे / आर्मी / TGT-PGT',
    'prog.p2_desc': 'प्रतियोगी परीक्षाओं के लिए गति गणित, रीजनिंग, सामान्य ज्ञान और पिछले वर्षों के प्रश्नों का गहन अभ्यास।',
    'prog.p3_title': 'सूर्योदय कंप्यूटर क्लासेस',
    'prog.p3_sub': 'CCC / ADCA / DCA / Tally',
    'prog.p3_desc': 'सरकारी मान्यता प्राप्त CCC परीक्षा तैयारी, 1-वर्षीय ADCA डिप्लोमा, Tally Accounting एवं प्रैक्टिकल कंप्यूटर ट्रेनिंग।',
    'prog.p4_title': 'टारगेट JEE / NEET / बोर्ड',
    'prog.p4_sub': 'एंट्रेंस एवं बोर्ड स्पेशल',
    'prog.p4_desc': 'फिजिक्स, केमिस्ट्री, मैथ्स और बायोलॉजी के आंकिक प्रश्नों (Numericals) का गहन अभ्यास और ऑल इंडिया टेस्ट सीरीज।',

    // Stats
    'stats.s1_num': '3,500+',
    'stats.s1_label': 'नामांकित छात्र',
    'stats.s2_num': '99.2%',
    'stats.s2_label': 'बोर्ड परीक्षा सफलता दर',
    'stats.s3_num': '450+',
    'stats.s3_label': 'चयन एवं सर्टिफिकेट्स',
    'stats.s4_num': '10+',
    'stats.s4_label': 'वर्षों का विश्वास',

    // Director Message
    'director.title': 'निदेशक का संदेश',
    'director.name': 'इंजीनियर आलोक कुमार',
    'director.sub': 'संस्थापक एवं निदेशक, सूर्योदय स्टडी प्वाइंट',
    'director.quote': 'सूर्योदय स्टडी प्वाइंट में हमारा उद्देश्य प्रत्येक छात्र को व्यक्तिगत मार्गदर्शन, अवधारणात्मक स्पष्टता और आधुनिक डिजिटल तकनीकों के माध्यम से सफलता की ओर ले जाना है। चाहे आप हमारे ऑफलाइन क्लासरूम में पढ़ रहे हों या ऑनलाइन पोर्टल के माध्यम से, हम गुणवत्तापूर्ण शिक्षा और निरंतर मार्गदर्शन सुनिश्चित करते हैं।',

    // CTA
    'cta.title_open': 'क्या आप बोर्ड और प्रतियोगी परीक्षाओं में अव्वल आने के लिए तैयार हैं?',
    'cta.sub_open': 'नए शैक्षणिक सत्र के लिए प्रवेश प्रारंभ हैं। कक्षा 6वीं से 12वीं, शाम के बैचेज, कॉम्पिटिशन और कंप्यूटर क्लासेस के लिए सूर्योदय स्टडी प्वाइंट से जुड़ें।',
    'cta.btn_apply': 'अभी ऑनलाइन आवेदन करें',
    'cta.btn_contact': 'हमसे संपर्क करें',

    // Footer
    'footer.quick_links': 'त्वरित नेविगेशन',
    'footer.portals': 'स्टूडेंट एवं अभिभावक पोर्टल',
    'footer.contact': 'संपर्क विवरण',
    'footer.rights': 'सर्वाधिकार सुरक्षित।',

    // Contact
    'contact.title': 'संपर्क करें',
    'contact.desc': 'हम आपके प्रश्नों का उत्तर देने एवं मार्गदर्शन हेतु सदैव तत्पर हैं। हमसे संपर्क करें।',
    'contact.get_in_touch': 'हमसे जुड़ें',
    'contact.location': 'हमारा पता',
    'contact.phone': 'फ़ोन नंबर',
    'contact.email': 'ईमेल पता',
    'contact.hours_label': 'परामर्श एवं कार्यालय समय',
    'contact.send_message': 'हमें संदेश भेजें',
    'contact.map_title': 'मैप पर हमारा केंद्र देखें',
    'contact.address': 'भवानी छपार बाजार (सिरिसिया बाबू रोड के पास), देवरिया, उत्तर प्रदेश - 274702',
    'contact.hours': 'परामर्श समय: सोमवार - शनिवार: सुबह 7:00 से शाम 7:00 बजे तक',

    // About Page
    'about.title': 'हमारे बारे में',
    'about.subtitle': 'वर्ष 2016 से ऑनलाइन और ऑफलाइन कोचिंग द्वारा छात्रों को सशक्त बनाना।',
    'about.p1': 'सूर्योदय स्टडी प्वाइंट (जिसे सूर्योदय कोचिंग, सूर्योदय कॉम्पिटिशन क्लासेस और कंप्यूटर क्लासेस के नाम से भी जाना जाता है) भवानी छपार बाजार (सिरिसिया बाबू रोड के पास), देवरिया जिला, उत्तर प्रदेश में स्थित है।',
    'about.p2': 'हम कक्षा 6वीं से 12वीं (CBSE एवं UP बोर्ड) के लिए शाम के सुविधाजनक बैचेज, प्रतियोगी परीक्षा तैयारी (सूर्योदय कॉम्पिटिशन क्लासेस - SSC, यूपी पुलिस, आर्मी, रेलवे, UP TGT/PGT) तथा सरकारी मान्यता प्राप्त कंप्यूटर क्लासेस (CCC, ADCA, DCA, Tally) प्रदान करते हैं।',
    'about.p3': 'हम दोहरे अध्ययन माध्यम प्रदान करते हैं: भवानी छपार कैंपस में ऑफलाइन क्लासरूम बैचेज तथा ऑनलाइन HD लाइव क्लासेस, रिकॉर्डेड लेक्चर्स, Daily Practice Papers (DPPs) एवं कंप्यूटर लैब अभ्यास।',
    'about.quote': '"हर सूर्योदय नई संभावनाएं लाता है। सूर्योदय स्टडी प्वाइंट में हम छात्रों को उत्कृष्ट शिक्षा और उज्ज्वल भविष्य की ओर मार्गदर्शन करने के लिए प्रतिबद्ध हैं।|"',
    'about.mission_title': 'हमारा मिशन',
    'about.mission_desc': 'लाइव ऑनलाइन कक्षाओं और अनुशासित ऑफलाइन क्लासरूम के माध्यम से प्रत्येक छात्र के लिए उच्च गुणवत्ता की शिक्षा सुलभ और किफायती बनाना।',
    'about.vision_title': 'हमारा दृष्टिकोण (विजन)',
    'about.vision_desc': 'बोर्ड टॉपर्स, इंजीनियर्स, डॉक्टर्स और प्रतियोगी परीक्षाओं के उत्कृष्ट लीडर्स तैयार करना जो देश के विकास में योगदान दें।',
    'about.highlights': 'संस्थान की प्रमुख विशेषताएं',

    // Academics Page
    'academics.title': 'सूर्योदय स्टडी प्वाइंट कोर्सेज',
    'academics.sub': 'कोर्सेज एवं बैचेज',
    'academics.desc': 'हम ऑनलाइन लाइव मोड और ऑफलाइन क्लासरूम मोड दोनों में डेली प्रैक्टिस, टेस्ट सीरीज और विशेषज्ञ शिक्षकों के साथ संपूर्ण कोचिंग बैचेज प्रदान करते हैं।',
    'academics.mode_title': 'अध्ययन का माध्यम चुनें',
    'academics.mode_desc': 'ऑनलाइन लाइव या ऑफलाइन क्लासरूम के अनुसार बैचेज देखें',
    'academics.all_batches': 'सभी बैचेज',
    'academics.online_batches': 'ऑनलाइन बैचेज',
    'academics.offline_batches': 'ऑफलाइन बैचेज',

    // Facilities Page
    'facilities.badge': 'आधुनिक इंफ्रास्ट्रक्चर',
    'facilities.title': 'सूर्योदय कोचिंग सुविधाएं',
    'facilities.desc': 'ऑनलाइन लाइव स्ट्रीमिंग के लिए आधुनिक तकनीक और ऑफलाइन बैचेज के लिए आरामदायक क्लासरूम सुविधाएं।',
    'facilities.f1_title': 'ऑनलाइन स्ट्रीमिंग हेतु HD स्टूडियो',
    'facilities.f1_desc': 'एचडी कैमरा सेटअप, स्मार्ट इंटरैक्टिव डिजिटल बोर्ड्स और शोर-रहित स्टूडियो जिससे स्पष्ट लाइव लेक्चर्स मिलें।',
    'facilities.f2_title': 'स्मार्ट एसी क्लासरूम्स',
    'facilities.f2_desc': 'आरामदायक वातावरण, अनुकूलित सीटिंग और डिजिटल बोर्ड से चित्रों व एनिमेशन के साथ स्पष्ट अध्ययन।',
    'facilities.f3_title': 'कंप्यूटर आधारित टेस्ट (CBT) लैब',
    'facilities.f3_desc': 'विशेष कंप्यूटर लैब जहाँ छात्र NTA जैसी राष्ट्रीय परीक्षाओं और ऑनलाइन मॉक टेस्ट का वास्तविक अभ्यास कर सकें।',
    'facilities.f4_title': 'लाइब्रेरी एवं शांत स्वाध्याय हॉल',
    'facilities.f4_desc': 'संदर्भ पुस्तकों, एचसी वर्मा, इरोडोव, एनसीईआरटी एग्जम्पलर पुस्तकों का समृद्ध संग्रह और शांत अध्ययन स्थान।',
    'facilities.f5_title': 'विशेष ऑफलाइन डाउट काउंटर्स',
    'facilities.f5_desc': 'नियमित कक्षाओं के पहले और बाद में शिक्षकों के साथ 1-ऑन-1 व्यक्तिगत डाउट समाधान की विशेष व्यवस्था।',
    'facilities.f6_title': 'स्टडी मटीरियल एवं DPP वितरण केंद्र',
    'facilities.f6_desc': 'इन-हाउस प्रिंटिंग व्यवस्था जिससे छात्रों को विस्तृत प्रिंटेड बुकलेट्स और डेली प्रैक्टिस पेपर्स (DPPs) प्राप्त हों।',

    // Admissions Page
    'admissions.title': 'ऑनलाइन प्रवेश फॉर्म',
    'admissions.closed': 'प्रवेश वर्तमान में बंद हैं',
    'admissions.criteria': 'प्रवेश नियम एवं निर्देश',
    'admissions.docs': 'आवश्यक दस्तावेज़',

    // Gallery Page
    'gallery.title': 'हमारी गैलरी',
    'gallery.desc': 'हमारे कोचिंग परिसर, स्मार्ट क्लासरूम्स, लैब और छात्र गतिविधियों की तस्वीरें देखें।',
    'gallery.tour': 'क्या आप कैंपस देखना चाहते हैं?',
    'gallery.book_tour': 'कैंपस विजिट शेड्यूल करें',

    // Notices Page
    'notices.title': 'सूचना पट्ट (नोटिस बोर्ड)',
    'notices.desc': 'आधिकारिक घोषणाएं, परीक्षा समय-सारणी, बैचेज सूचनाएं और नए अपडेट।',
    'notices.search': 'कीवर्ड, शीर्षक या सूचना विवरण द्वारा खोजें...',

    // Language Toggle Label
    'lang.current': 'हिंदी',
    'lang.switch': 'Switch to English',

    // Auth & Login
    'auth.login_title': 'छात्र एवं यूजर लॉगिन',
    'auth.login_subtitle': 'सूर्योदय स्टडी पॉइंट छात्र पोर्टल, लाइव क्लास एवं स्टडी नोट्स हेतु लॉगिन करें',
    'auth.login_id_label': 'मोबाइल नंबर / ईमेल / छात्र आईडी',
    'auth.login_id_placeholder': '10-अंकों का मोबाइल नंबर या ईमेल आईडी दर्ज करें',
    'auth.password_label': 'पासवर्ड',
    'auth.password_placeholder': 'अपना पासवर्ड दर्ज करें',
    'auth.remember_me': 'मुझे याद रखें',
    'auth.forgot_password': 'पासवर्ड भूल गए?',
    'auth.btn_sign_in': 'पोर्टल में लॉगिन करें',
    'auth.authenticating': 'प्रमाणित हो रहा है...',
    'auth.no_account': 'क्या आपका छात्र खाता नहीं बना है?',
    'auth.btn_create_account': 'नया छात्र खाता बनाएं',
    'auth.reg_title': 'नया छात्र पंजीयन',
    'auth.reg_subtitle': 'अपनी व्यक्तिगत सूर्योदय स्टडी पॉइंट स्टूडेंट आईडी बनाएं',
    'auth.reg_student_info': 'छात्र / अभ्यर्थी विवरण',
    'auth.full_name': 'छात्र का पूरा नाम',
    'auth.full_name_placeholder': 'उदा. राहुल कुमार',
    'auth.select_course': 'कोर्स / वर्ग का चयन करें',
    'auth.course_academic': 'स्कूली शिक्षा (कक्षा 6वीं से 12वीं)',
    'auth.course_competition': 'सूर्योदय कॉम्पिटिशन क्लासेस (SSC/पुलिस/रेलवे)',
    'auth.course_computer': 'सूर्योदय कंप्यूटर क्लासेस (CCC/ADCA/Tally)',
    'auth.mobile_number': 'मोबाइल नंबर (10 अंक)',
    'auth.mobile_placeholder': 'उदा. 9876543210',
    'auth.email_address': 'ईमेल आईडी',
    'auth.email_placeholder': 'उदा. student@example.com',
    'auth.create_password': 'पासवर्ड बनाएं',
    'auth.password_min_placeholder': 'कम से कम 6 अक्षर',
    'auth.btn_register': 'छात्र खाता पंजीकृत करें',
    'auth.creating_account': 'खाता बनाया जा रहा है...',
    'auth.btn_back_login': 'साइन इन पर वापस जाएं',
    'auth.reset_title': 'पासवर्ड रीसेट करें',
    'auth.reset_sub': 'अपना पंजीकृत ईमेल दर्ज करें, आपको रीसेट लिंक भेज दिया जाएगा।',
    'auth.reset_email_label': 'ईमेल पता',
    'auth.reset_email_placeholder': 'ईमेल दर्ज करें',
    'auth.cancel': 'रद्द करें',
    'auth.send_reset_link': 'रीसेट लिंक भेजें'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('suryoday_lang');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'hi') {
      document.documentElement.classList.add('lang-hi');
    } else {
      document.documentElement.classList.remove('lang-hi');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('suryoday_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const fallbackDict = translations['en'];
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

/**
 * Reusable Header/Nav Language Toggle Button Component
 */
export const LanguageSwitcher: React.FC<{ className?: string, variant?: 'pill' | 'button' | 'compact' | 'icon' }> = ({ className = '', variant = 'pill' }) => {
  const { language, toggleLanguage } = useLanguage();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-amber-100 text-crhs-navy text-xs font-bold transition-all duration-200 border border-slate-200 shadow-sm active:scale-95 ${className}`}
        title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
        aria-label="Switch Language"
      >
        <Languages className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="text-[11px] font-black leading-none">{language === 'en' ? 'हिंदी' : 'EN'}</span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded border transition-all duration-200 ${
          language === 'hi' 
            ? 'bg-amber-400 text-crhs-navy border-amber-400 shadow-sm' 
            : 'bg-white/10 text-amber-300 border-white/20 hover:bg-white/20'
        } ${className}`}
        title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
        aria-label="Switch Language"
      >
        <Languages className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span className="font-extrabold">{language === 'en' ? 'HI' : 'EN'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm border ${
        language === 'hi'
          ? 'bg-amber-500 text-crhs-navy border-amber-400 ring-1 ring-amber-300/50'
          : 'bg-slate-100 text-crhs-navy border-slate-300 hover:bg-amber-100 hover:border-amber-400'
      } ${className}`}
      title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
      aria-label="Switch Language"
    >
      <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span className="font-extrabold">{language === 'en' ? 'HI' : 'EN'}</span>
    </button>
  );
};
