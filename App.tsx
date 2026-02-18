
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, 
  Sun, 
  MessageCircle, 
  BookOpen, 
  Clock, 
  Star, 
  Heart,
  ChevronRight,
  MapPin,
  RefreshCw,
  Sparkles,
  Zap,
  Book as BookIcon,
  ChevronLeft,
  UtensilsCrossed,
  Droplets,
  Shield,
  CheckCircle2,
  Calendar as CalendarIcon,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { generateRamadanGreeting, generateDailyReflection } from './services/geminiService';
import { GreetingResponse, ReflectionResponse, PrayerTimes, LocationData, QuranVerse } from './types';

type Theme = 'light' | 'dark';

// Animated background elements
const FloatingElements = ({ theme }: { theme: Theme }) => {
  const elements = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 20 + 10,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 5 + 5}s`,
      type: i % 3 === 0 ? 'star' : i % 3 === 1 ? 'moon' : 'dot'
    }));
  }, []);

  const colorClass = theme === 'dark' ? 'text-yellow-500/10' : 'text-yellow-600/5';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el) => (
        <div
          key={el.id}
          className={`absolute animate-twinkle ${colorClass}`}
          style={{
            left: el.left,
            top: el.top,
            animationDelay: el.delay,
            animationDuration: el.duration
          }}
        >
          {el.type === 'star' && <Star size={el.size} fill="currentColor" />}
          {el.type === 'moon' && <Moon size={el.size} fill="currentColor" />}
          {el.type === 'dot' && <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-600/10'}`} />}
        </div>
      ))}
      <div className="absolute top-10 left-[10%] animate-sway hidden md:block">
        <div className={`w-px h-20 mx-auto ${theme === 'dark' ? 'bg-yellow-500/30' : 'bg-yellow-600/20'}`} />
        <div className={`w-8 h-12 border rounded-b-xl flex items-center justify-center relative shadow-lg ${
          theme === 'dark' ? 'bg-yellow-600/20 border-yellow-500/40 shadow-yellow-900/20' : 'bg-white border-yellow-200 shadow-yellow-200/50'
        }`}>
          <div className={`w-4 h-4 blur-sm rounded-full animate-pulse ${theme === 'dark' ? 'bg-yellow-400/40' : 'bg-yellow-500/60'}`} />
        </div>
      </div>
    </div>
  );
};

// Components
const Navbar = ({ activeTab, setActiveTab, theme, toggleTheme }: { 
  activeTab: string, 
  setActiveTab: (t: string) => void,
  theme: Theme,
  toggleTheme: () => void
}) => (
  <nav className={`fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto border-t md:border-t-0 md:border-b border-yellow-500/20 z-50 transition-colors duration-500 ${
    theme === 'dark' ? 'bg-slate-950/90 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl'
  }`}>
    <div className="max-w-7xl mx-auto px-1 h-16 flex items-center justify-around md:justify-between">
      <div className="flex items-center space-x-2 md:space-x-4">
        <button 
          onClick={() => setActiveTab('home')}
          className="hidden md:flex items-center space-x-2 group"
        >
          <Moon className={`fill-yellow-500 group-hover:scale-110 transition-transform animate-glow ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`} size={24} />
          <span className="font-amiri text-xl font-bold gradient-text">Ramadan 2026</span>
        </button>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-90 ${
            theme === 'dark' ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-yellow-600 hover:bg-slate-200'
          }`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <div className="flex items-center space-x-1 md:space-x-4 lg:space-x-6">
        {[
          { id: 'home', icon: Moon, label: 'Home' },
          { id: 'calendar', icon: CalendarIcon, label: 'Cal' },
          { id: 'quran', icon: BookIcon, label: 'Quran' },
          { id: 'faith', icon: Shield, label: 'Faith' },
          { id: 'duas', icon: UtensilsCrossed, label: 'Duas' },
          { id: 'timings', icon: Clock, label: 'Times' },
          { id: 'wisdom', icon: BookOpen, label: 'Soul' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 transition-all duration-300 relative px-1 md:px-0 ${
              activeTab === item.id 
                ? 'text-yellow-500 scale-105' 
                : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <item.icon size={16} className={activeTab === item.id ? 'animate-pulse' : ''} />
            <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  </nav>
);

const FaithEssentials = ({ theme }: { theme: Theme }) => {
  const [faithTab, setFaithTab] = useState<'iman' | 'kalimas'>('iman');
  const [memoryMode, setMemoryMode] = useState(false);

  const cardBg = theme === 'dark' ? 'bg-slate-900/60 border-yellow-500/20' : 'bg-white border-yellow-100 shadow-xl';
  const headingColor = theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600';
  const textColor = theme === 'dark' ? 'text-slate-200' : 'text-slate-800';
  const subText = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  const kalimas = [
    {
      title: "First Kalima: Tayyaba (Purity)",
      arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَّسُولُ اللّٰهِ‎",
      translation: "اللہ کے سوا کوئی معبود نہیں، محمد اللہ کے رسول ہیں۔",
      transliteration: "La ilaha illallahu Muhammadur Rasulullah."
    },
    {
      title: "Second Kalima: Shahadat (Evidence)",
      arabic: "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِیکَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ‎",
      translation: "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اور میں گواہی دیتا ہوں کہ محمد اللہ کے بندے اور رسول ہیں۔",
      transliteration: "Ash-hadu alla ilaha illallahu wahdahu la sharika lahu wa ash-hadu anna Muhammadan abduhu wa Rasuluh."
    },
    {
      title: "Third Kalima: Tamjeed (Glory)",
      arabic: "سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ‎",
      translation: "پاک ہے اللہ اور تمام تعریف اللہ ہی کے لیے ہے، اور اللہ کے سوا کوئی معبود نہیں، اور اللہ سب سے بڑا ہے، اور گناہوں سے بچنے کی طاقت اور نیکی کرنے کی قوت اللہ ہی کی طرف سے ہے جو بلند و برتر اور عظمت والا ہے۔",
      transliteration: "Subhanallahi wal hamdu lillahi wa la ilaha illallahu wallahu akbar, wala hawla wala quwwata illa billahil aliyyil azim."
    },
    {
      title: "Fourth Kalima: Tauheed (Oneness)",
      arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيکَ لَهُ لَهُ الْمُلْکُ وَ لَهُ الْمُلْکُ وَ لَهُ الْحَمْدُ يُحْيِي وَ يُمیِتُ وَ هُوَ حَيٌّ لَا يَمُوتُ أَبَدًا أَبَدًا ذُو الْجَلَالِ وَ الْإِكْرَامِ بِيَدِهِ الْخَيْرُ وَ هُوَ عَلَى کُلِّ شَيْءٍ قَدِيرٌ‎",
      translation: "اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کی بادشاہی ہے اور اسی کے لیے تمام تعریف ہے، وہی زندگی دیتا ہے اور وہی موت دیتا ہے، اور وہ خود ہمیشہ زندہ رہنے والا ہے، اسے کبھی موت نہیں آئے گی، وہ بڑی عظمت اور بزرگی والا ہے، خیر اس کے ہاتھ میں ہے اور وہ ہر چیز پر قادر ہے۔",
      transliteration: "La ilaha illallahu wahdahu la sharika lahu lahul mulku wa lahul hamdu yuhyi wa yumitu wa huwa hayyul la yamutu abadan abada, dhul jalali wal ikram, biyadihil khayr, wa huwa ala kulli shay’in qadir."
    },
    {
      title: "Fifth Kalima: Astaghfar (Repentance)",
      arabic: "أَسْتَغْفِرُ اللّٰهَ رَبِّي مِنْ كُلِّ ذَنْبٍ أَذْنَبْتُهُ عَمَدًا أَوْ خَطَأً سِرًّا أَوْ عَلَانِيَةً وَأَتُوبُ إِلَيْهِ مِنَ الذَّنْبِ الَّذِي أَعْلَمُ وَمِنَ الذَّنْبِ الَّذِي لَا أَعْلَمُ إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ وَسَتَّارُ الْعُيُوبِ وَغَفَّارُ الذُّنُوبِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ‎",
      translation: "میں اپنے رب اللہ سے اپنے تمام گناہوں کی معافی مانگتا ہوں جو میں نے جان بوجھ کر کیے یا بھولے سے، چھپ کر کیے یا اعلانیہ، اور میں اس کی بارگاہ میں توبہ کرتا ہوں ان گناہوں سے جنہیں میں جانتا ہوں اور ان گناہوں سے بھی جنہیں میں نہیں جانتا۔ بے شک تو غیبوں کا جاننے والا، عیبوں کا چھپانے والا اور گناہوں کا بخشنے والا ہے، اور اللہ کے سوا کوئی طاقت اور قوت نہیں جو بلند و برتر اور عظمت والا ہے۔",
      transliteration: "Astaghfirullaha rabbi min kulli dhanbin adnabtuhu amadan aw khata'an sirran aw alaniyatan wa atubu ilayhi minad dhanbilladhi alamu wa minad dhanbilladhi la alamu, innaka anta allamul ghuyubi wa sattarul uyubi wa ghaffarudh dhunubi wala hawla wala quwwata illa billahil aliyyil azim."
    },
    {
      title: "Sixth Kalima: Rad-de-Kufr (Rejecting Disbelief)",
      arabic: "اَللّٰهُمَّ اِنِّیْ اَعُوْذُ بِكَ مِنْ اَنْ اُشْرِكَ بِكَ شَيْئًا وَّاَنَا اَعْلَمُ بِهٖ وَاَسْتَغْفِرُكَ لِمَا لَا اَعْلَمُ بِهٖ تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ الْكُفْرِ وَالشِّرِّكِ وَالْكِذْبِ وَالْغِيْبَةِ وَالْبِدْعَةِ وَالنَّمِيْمَةِ وَالْفَوَاحِشِ وَالْبُهْتَانِ وَالْمَعَاصِيْ كُلِّهَا وَاَسْلَمْتُ وَاَقُوْلُ لَا اِلٰهَ اِلَّا اللّٰهُ مُحَمَّدٌ رَّسُوْلُ اللّٰهِ‎",
      translation: "اے اللہ! میں تیری پناہ مانگتا ہوں اس بات سے کہ میں کسی چیز کو تیرا شریک ٹھہراؤں اور مجھے اس کا علم ہو، اور میں تجھ سے معافی مانگتا ہوں اس گناہ سے جس کا مجھے علم نہیں۔ میں نے اس سے توبہ کی اور میں کفر، شرک، جھوٹ، غیبت، بدعت، چغلی، بے حیائی، بہتان اور تمام گناہوں سے بیزار ہوا، اور میں اسلام لایا اور کہتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، محمد اللہ کے رسول ہیں۔",
      transliteration: "Allahumma inni audhubika min an ushrika bika shayan wa ana alamu bihi wa astaghfiruka lima la alamu bihi tubtu anhu wa tabarratu minal kufri wash shirki wal kidhbi wal ghibati wal bidati wan namimati wal fawahishi wal buhtani wal maasi kulliha wa aslamtu wa aqulu la ilaha illallahu Muhammadur Rasulullah."
    }
  ];

  return (
    <div className="pt-8 pb-24 px-4 max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h2 className={`text-5xl font-amiri font-bold ${headingColor}`}>Faith Essentials</h2>
        <p className={`${subText} font-medium tracking-widest uppercase text-xs`}>Core Beliefs & The Pillars of Faith</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className={`p-1 rounded-2xl flex border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <button 
            onClick={() => setFaithTab('iman')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${faithTab === 'iman' ? 'bg-yellow-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Iman (Belief)
          </button>
          <button 
            onClick={() => setFaithTab('kalimas')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${faithTab === 'kalimas' ? 'bg-yellow-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Six Kalimas
          </button>
        </div>

        <button 
          onClick={() => setMemoryMode(!memoryMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            memoryMode ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'border-slate-800 text-slate-500'
          }`}
        >
          {memoryMode ? <EyeOff size={14} /> : <Eye size={14} />}
          {memoryMode ? 'Memory Mode: ON' : 'Memory Mode: OFF'}
        </button>
      </div>

      {faithTab === 'iman' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          {/* Iman-e-Mufassal */}
          <div className={`${cardBg} p-8 rounded-[3.5rem] border backdrop-blur-xl relative overflow-hidden group shadow-2xl transition-all`}>
             <div className="flex items-center gap-4 mb-8">
              <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                <Shield className="text-yellow-500" size={32} />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Iman-e-Mufassal</h3>
                <p className="text-[10px] text-yellow-600 font-black uppercase tracking-[0.2em]">The Faith Specified</p>
              </div>
            </div>
            <p className="font-amiri text-2xl md:text-3xl text-right leading-[1.8] text-white mb-8" dir="rtl">
              آمنْتُ بِاللّهِ وَ مَلائِكَتِهِ وَ كُتُبِهِ وَ رُسُلِهِ وَ الْيَوْمِ الآخِرِ وَ الْقَدْرِ خَيْرِهِ وَ شَرِّهِ مِنَ اللّهِ تَعَالَى وَ الْبَعْثِ بَعْدَ الْمَوْتِ
            </p>
            {!memoryMode && (
              <div className="space-y-4 border-t border-slate-800 pt-6 animate-in slide-in-from-top-2">
                <p className="text-[10px] text-yellow-600 font-black uppercase tracking-widest mb-1">Urdu Translation</p>
                <p className={`font-amiri text-lg text-right leading-relaxed ${textColor}`} dir="rtl">
                  میں ایمان لایا اللہ پر، اس کے فرشتوں پر، اس کی کتابوں پر، اس کے رسولوں پر، قیامت کے دن پر اور اس پر کہ اچھی اور بری تقدیر اللہ ہی کی طرف سے ہے اور موت کے بعد دوبارہ اٹھائے جانے پر۔
                </p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Transliteration</p>
                <p className={`${subText} italic text-sm leading-relaxed`}>Amantu billahi wa mala'ikatihi wa kutubihi wa rusulihi wal yawmil akhiri wal qadri khayrihi wa sharrihi minallahi ta'ala wal bathi badal mawt.</p>
              </div>
            )}
          </div>

          {/* Iman-e-Mujamal */}
          <div className={`${cardBg} p-8 rounded-[3.5rem] border backdrop-blur-xl relative overflow-hidden group shadow-2xl transition-all`}>
             <div className="flex items-center gap-4 mb-8">
              <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                <CheckCircle2 className="text-yellow-500" size={32} />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Iman-e-Mujamal</h3>
                <p className="text-[10px] text-yellow-600 font-black uppercase tracking-[0.2em]">The Faith in Brief</p>
              </div>
            </div>
            <p className="font-amiri text-2xl md:text-3xl text-right leading-[1.8] text-white mb-8" dir="rtl">
              آمَنْتُ بِاللّهِ كَمَا هُوَ بِأَسْمَائِهِ وَصِفَاتِهِ وَقَبِلْتُ جَمِيْعَ أَحْكَامِهِ
            </p>
            {!memoryMode && (
              <div className="space-y-4 border-t border-slate-800 pt-6 animate-in slide-in-from-top-2">
                <p className="text-[10px] text-yellow-600 font-black uppercase tracking-widest mb-1">Urdu Translation</p>
                <p className={`font-amiri text-lg text-right leading-relaxed ${textColor}`} dir="rtl">
                  میں ایمان لایا اللہ پر جیسا کہ وہ اپنے ناموں اور اپنی صفتوں کے ساتھ ہے اور میں نے اس کے تمام احکام قبول کیے۔
                </p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Transliteration</p>
                <p className={`${subText} italic text-sm leading-relaxed`}>Amantu billahi kama huwa bi asmaihi wa sifatihi wa qabiltu jami'a ahkamihi.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {faithTab === 'kalimas' && (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-500">
          {kalimas.map((kalima, index) => (
            <div key={index} className={`${cardBg} p-10 rounded-[4rem] border backdrop-blur-xl relative overflow-hidden group shadow-2xl transition-all`}>
              <div className="flex justify-between items-center mb-8">
                <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-yellow-100' : 'text-slate-800'}`}>{kalima.title}</h4>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-50 text-yellow-700'}`}>
                  Kalima {index + 1}
                </div>
              </div>
              <p className="font-amiri text-3xl md:text-4xl text-right leading-[1.8] text-white mb-10 drop-shadow-md" dir="rtl">
                {kalima.arabic}
              </p>
              {!memoryMode && (
                <div className="space-y-8 border-t border-slate-800 pt-8 animate-in slide-in-from-top-4">
                  <div>
                    <p className="text-[10px] text-yellow-600 font-black uppercase tracking-widest mb-3">Urdu Translation</p>
                    <p className={`font-amiri text-xl text-right leading-relaxed ${textColor}`} dir="rtl">
                      {kalima.translation}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Transliteration</p>
                    <p className={`${subText} italic text-sm leading-relaxed`}>
                      {kalima.transliteration}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RamadanCalendar = ({ theme }: { theme: Theme }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const headingColor = theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600';
  const cardBg = theme === 'dark' ? 'bg-slate-900/60 border-yellow-500/20' : 'bg-white border-yellow-100 shadow-lg';

  const specialEvents: Record<number, string> = {
    1: "First Day of Ramadan",
    10: "Passing of Khadija (RA)",
    17: "Battle of Badr Anniversary",
    20: "Conquest of Makkah",
    21: "Martyrdom of Imam Ali (RA)",
    27: "Laylat-al-Qadr (Estimated)",
    30: "Moon Sighting / Chand Raat"
  };

  const getAshra = (day: number) => {
    if (day <= 10) return "Mercy (Rehmat)";
    if (day <= 20) return "Forgiveness (Maghfirat)";
    return "Safety (Nijat)";
  };

  return (
    <div className="pt-8 pb-24 px-4 max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h2 className={`text-5xl font-amiri font-bold ${headingColor}`}>Ramadan Calendar</h2>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium tracking-widest uppercase text-xs`}>
          30 Days of Spiritual Growth • 2026 CE
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {Array.from({ length: 30 }).map((_, i) => {
          const day = i + 1;
          const hasEvent = specialEvents[day];
          const isAshraEnd = day % 10 === 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`relative group aspect-square rounded-[2rem] border flex flex-col items-center justify-center gap-1 transition-all duration-500 hover:scale-105 overflow-hidden ${
                selectedDay === day 
                ? 'ring-2 ring-yellow-500 scale-105' 
                : ''
              } ${
                theme === 'dark' 
                ? 'bg-slate-900/40 border-slate-800 hover:border-yellow-500/30' 
                : 'bg-white border-slate-100 hover:border-yellow-200 shadow-sm'
              }`}
            >
              <div className={`absolute top-0 right-0 p-2 opacity-10 ${theme === 'dark' ? 'text-white' : 'text-yellow-600'}`}>
                {day <= 10 ? <Droplets size={12} /> : day <= 20 ? <Shield size={12} /> : <Star size={12} />}
              </div>
              
              <span className={`text-2xl font-bold transition-colors ${theme === 'dark' ? 'text-yellow-100' : 'text-slate-800'}`}>
                {day}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Ramadan</span>
              
              {hasEvent && (
                <div className="absolute bottom-3 flex items-center gap-1">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-[6px] text-yellow-600 font-bold uppercase tracking-tight">Event</span>
                </div>
              )}
              
              {isAshraEnd && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
              )}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className={`p-8 md:p-12 rounded-[3rem] border animate-in zoom-in duration-500 ${cardBg}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="space-y-2">
              <h3 className={`text-4xl font-amiri font-bold ${theme === 'dark' ? 'text-yellow-100' : 'text-slate-900'}`}>
                Day {selectedDay} Summary
              </h3>
              <p className="text-yellow-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Info size={14} /> Ashra: {getAshra(selectedDay)}
              </p>
            </div>
            {specialEvents[selectedDay] && (
              <div className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-3">
                <Star className="text-yellow-500 animate-glow" size={20} />
                <span className="text-sm font-bold text-yellow-100">{specialEvents[selectedDay]}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Clock size={12} /> Timing Highlights
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Suhoor</p>
                  <p className="text-lg font-bold text-yellow-500">Fast Start</p>
                </div>
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Iftar</p>
                  <p className="text-lg font-bold text-blue-400">Blessing</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 col-span-1 md:col-span-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Sparkles size={12} /> Spiritual Path
              </h4>
              <div className={`p-6 rounded-[2rem] border transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-lg italic font-amiri leading-relaxed transition-colors ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  "May this day of the Ashra of {getAshra(selectedDay)} bring tranquility to your heart and discipline to your soul."
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setSelectedDay(null)}
            className="mt-12 text-slate-500 hover:text-yellow-500 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2 mx-auto"
          >
            <ChevronLeft size={16} /> View Full Grid
          </button>
        </div>
      )}
    </div>
  );
};

const SacredDuas = ({ theme }: { theme: Theme }) => {
  const cardBg = theme === 'dark' ? 'bg-slate-900/60 border-yellow-500/20' : 'bg-white border-yellow-100 shadow-xl';
  const subText = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const headingColor = theme === 'dark' ? 'text-yellow-100' : 'text-slate-800';

  return (
    <div className="pt-8 pb-24 px-4 max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h2 className={`text-5xl font-amiri font-bold transition-colors ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>Sacred Duas</h2>
        <p className={`${subText} font-medium tracking-widest uppercase text-xs`}>Essential supplications for Suhoor and Iftar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`${cardBg} p-8 rounded-[3rem] border backdrop-blur-xl relative overflow-hidden group shadow-2xl transition-all duration-500`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
              <Sun className="text-yellow-500 animate-glow" size={32} />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${headingColor}`}>Sehri Dua</h3>
              <p className={`text-xs uppercase tracking-widest font-black ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Dua for Fasting</p>
            </div>
          </div>
          <p className={`font-amiri text-3xl md:text-4xl text-right leading-[1.8] drop-shadow-sm transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} dir="rtl">
            وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ
          </p>
          <div className={`space-y-4 border-t pt-6 mt-8 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <p className="text-[10px] text-yellow-600 font-black uppercase tracking-[0.2em] mb-2">Urdu Translation</p>
            <p className={`font-amiri text-xl text-right transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`} dir="rtl">
              اور میں نے ماہِ رمضان کے کل کے روزے کی نیت کی۔
            </p>
          </div>
        </div>

        <div className={`${cardBg} p-8 rounded-[3rem] border backdrop-blur-xl relative overflow-hidden group shadow-2xl transition-all duration-500`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <Moon className="text-blue-400 animate-glow" size={32} />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-100' : 'text-slate-800'}`}>Iftar Dua</h3>
              <p className={`text-xs uppercase tracking-widest font-black ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Breaking the Fast</p>
            </div>
          </div>
          <p className={`font-amiri text-3xl md:text-4xl text-right leading-[1.8] drop-shadow-sm transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} dir="rtl">
            اَللّٰهُمَّ اِنِّی لَکَ صُمْتُ وَبِکَ اٰمَنْتُ وَعَلٰی رِزْقِکَ اَفْطَرْتُ
          </p>
          <div className={`space-y-4 border-t pt-6 mt-8 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mb-2">Urdu Translation</p>
            <p className={`font-amiri text-xl text-right transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`} dir="rtl">
              اے اللہ! میں نے تیرے ہی لیے روزہ رکھا اور تجھ پر ہی ایمان لایا اور تیرے ہی عطا کردہ رزق سے افطار کیا۔
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuranReader = ({ theme }: { theme: Theme }) => {
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJuz = async (juzNumber: number) => {
    setLoading(true);
    setSelectedJuz(juzNumber);
    try {
      const [arRes, urRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/quran-simple`),
        fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/ur.ahmedali`)
      ]);
      const arData = await arRes.json();
      const urData = await urRes.json();
      const combined = arData.data.ayahs.map((ayah: any, index: number) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: urData.data.ayahs[index].text,
        surah: ayah.surah.name
      }));
      setVerses(combined);
    } catch (err) {
      console.error("Failed to fetch Quran Juz", err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedJuz && !loading) {
    return (
      <div className="pt-4 pb-24 px-4 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <button onClick={() => setSelectedJuz(null)} className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-bold mb-4">
          <ChevronLeft size={20} /> Back to Sipaarey
        </button>
        <div className="text-center mb-10">
          <h2 className={`text-4xl font-amiri font-bold mb-2 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>Siparah {selectedJuz}</h2>
          <div className="h-1 w-24 bg-yellow-500/20 mx-auto rounded-full" />
        </div>
        <div className="space-y-8">
          {verses.map((verse, i) => (
            <div key={i} className={`p-8 rounded-[2rem] border transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-yellow-500/10' : 'bg-white border-yellow-100 shadow-lg'}`}>
              <div className="flex justify-between items-start mb-6">
                <span className="w-10 h-10 rounded-full border border-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-600">{verse.number}</span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{verse.surah}</span>
              </div>
              <p className={`font-amiri text-3xl md:text-4xl text-right leading-[1.8] mb-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} dir="rtl">{verse.text}</p>
              <p className={`text-lg md:text-xl font-amiri text-right leading-relaxed border-t pt-6 ${theme === 'dark' ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-100'}`} dir="rtl">{verse.translation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-24 px-4 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className={`text-5xl font-amiri font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>Quran Majeed</h2>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium tracking-widest uppercase text-xs`}>Explore all 30 Sipaarey (Juz) with Tarjuma</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {Array.from({ length: 30 }).map((_, i) => (
          <button key={i} onClick={() => fetchJuz(i + 1)} className={`relative group aspect-square rounded-3xl border flex flex-col items-center justify-center gap-3 transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-yellow-500/10 hover:border-yellow-500/50' : 'bg-white border-yellow-100 shadow-xl'}`}>
            <BookIcon className={`${theme === 'dark' ? 'text-yellow-600' : 'text-yellow-700'}`} size={28} />
            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-100' : 'text-slate-900'}`}>{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Home = ({ onStartGreeting, theme, setActiveTab }: { onStartGreeting: () => void, theme: Theme, setActiveTab: (t: string) => void }) => (
  <div className="pt-8 pb-24 px-4 max-w-4xl mx-auto text-center space-y-16 animate-in fade-in zoom-in duration-700">
    <div className="relative inline-block">
      <div className={`absolute inset-0 blur-[60px] rounded-full animate-pulse ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-200/40'}`} />
      <Moon size={140} className={`relative mx-auto animate-float drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] ${
        theme === 'dark' ? 'text-yellow-500 fill-yellow-500/10' : 'text-yellow-600 fill-yellow-500/5'
      }`} />
      <Star size={32} className={`absolute -top-4 -right-4 animate-twinkle ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-500'}`} />
    </div>
    
    <div className="space-y-6">
      <h1 className={`text-5xl md:text-7xl font-amiri font-bold leading-tight ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-700'}`}>
        <span className="block text-2xl font-sans tracking-[0.2em] text-yellow-600/80 mb-2">RAMADAN 2026</span>
        1st <span className="animate-shimmer animate-text-glow inline-block">Ramzan Mubarak</span>
      </h1>
      <div className={`max-w-2xl mx-auto p-6 border rounded-[2.5rem] backdrop-blur-sm transition-colors ${
        theme === 'dark' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white border-yellow-200 shadow-2xl'
      }`}>
        <p className={`text-xl font-amiri leading-relaxed ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
          "<span className="animate-text-glow text-yellow-500">Ramzan mubarak sab ko meri taraf sy from Bilal!</span> <br/>
          <span className={`${theme === 'dark' ? 'text-yellow-600/80' : 'text-yellow-600'} italic`}>Bless you everyone with good health and happiness.</span>"
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
      {[
        { id: 'calendar', icon: CalendarIcon, color: 'text-orange-400', bg: 'bg-orange-400/5', border: 'border-orange-400/20', title: 'Ramadan Calendar', desc: '30-day view of events & prayers.' },
        { id: 'faith', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-400/5', border: 'border-indigo-400/20', title: 'Faith Essentials', desc: 'Six Kalimas and Essential Faith.' },
        { id: 'quran', icon: BookIcon, color: 'text-yellow-400', bg: 'bg-yellow-400/5', border: 'border-yellow-400/20', title: 'Quran Majeed', desc: 'Read 30 Sipaarey with Urdu Tarjuma.' },
        { id: 'duas', icon: UtensilsCrossed, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/20', title: 'Sacred Duas', desc: 'Duas for Sehri and Aftari.' },
        { id: 'timings', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/20', title: 'Timings', desc: 'Accurate Suhoor and Iftar times.' },
        { id: 'wisdom', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20', title: 'Soul Wisdom', desc: 'Daily spiritual reflections.' }
      ].map((card, i) => (
        <div 
          key={i}
          onClick={() => setActiveTab(card.id)}
          className={`p-6 rounded-[2.5rem] border hover:scale-105 transition-all duration-500 group cursor-pointer shadow-xl ${
            theme === 'dark' ? `${card.bg} ${card.border} shadow-black/20` : 'bg-white border-slate-100 shadow-slate-200/50'
          }`}
        >
          <card.icon className={`${card.color} mx-auto mb-4 group-hover:scale-125 transition-transform duration-500`} size={28} />
          <h3 className={`font-bold text-base mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{card.title}</h3>
          <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{card.desc}</p>
        </div>
      ))}
    </div>

    <button onClick={onStartGreeting} className="group bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold py-5 px-10 rounded-full shadow-2xl flex items-center space-x-3 mx-auto transition-all transform hover:scale-105">
      <Zap size={20} className="group-hover:animate-bounce" />
      <span className="text-lg">Send a Ramadan Blessing</span>
      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

const Greetings = ({ theme }: { theme: Theme }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Friend');
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState<GreetingResponse | null>(null);

  const handleGenerate = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const res = await generateRamadanGreeting(name, relation);
      setGreeting(res);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="pt-8 pb-24 px-4 max-w-2xl mx-auto space-y-8">
      <div className={`p-8 rounded-[2.5rem] border backdrop-blur-xl shadow-2xl ${theme === 'dark' ? 'bg-slate-900/60 border-yellow-500/20' : 'bg-white border-yellow-100'}`}>
        <h2 className={`text-3xl font-amiri font-bold mb-8 flex items-center gap-3 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>
          <MessageCircle className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'} /> Craft a Wish
        </h2>
        <div className="space-y-6">
          <input type="text" placeholder="Receiver's Name" className={`w-full border rounded-2xl px-6 py-4 outline-none ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-yellow-100' : 'bg-slate-50 border-slate-100 text-slate-900'}`} value={name} onChange={(e) => setName(e.target.value)} />
          <select className={`w-full border rounded-2xl px-6 py-4 outline-none ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`} value={relation} onChange={(e) => setRelation(e.target.value)}>
            <option>Friend</option><option>Family Member</option><option>Parent</option><option>Spouse</option><option>Colleague</option>
          </select>
          <button onClick={handleGenerate} disabled={loading || !name} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all transform active:scale-95">
            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={20} />}
            <span className="text-lg">{loading ? 'Creating Magic...' : 'Generate Blessing'}</span>
          </button>
        </div>
      </div>
      {greeting && (
        <div className={`p-10 rounded-[3rem] border animate-in fade-in zoom-in duration-500 relative overflow-hidden group shadow-2xl ${theme === 'dark' ? 'bg-gradient-to-b from-yellow-500/10 to-transparent border-yellow-500/40' : 'bg-white border-yellow-200'}`}>
          <p className={`font-amiri text-3xl text-center leading-relaxed animate-text-glow ${theme === 'dark' ? 'text-yellow-100' : 'text-slate-900'}`}>"{greeting.message}"</p>
          <div className={`p-6 rounded-3xl border mt-8 ${theme === 'dark' ? 'bg-slate-950/50 border-yellow-500/10' : 'bg-yellow-50 border-yellow-100'}`}>
            <p className="text-yellow-600 text-xs font-bold uppercase mb-2">Our Prayer for {name}</p>
            <p className={`italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{greeting.blessing}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Timings = ({ theme }: { theme: Theme }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      });
    }
  }, []);

  useEffect(() => {
    const fetchTimes = async () => {
      if (!location) return;
      setLoading(true);
      try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${location.latitude}&longitude=${location.longitude}&method=2`);
        const data = await response.json();
        setTimes(data.data.timings);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchTimes();
  }, [location]);

  if (loading) return <div className="pt-32 text-center text-slate-400">Syncing with the Stars...</div>;

  return (
    <div className="pt-8 pb-24 px-4 max-w-2xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h2 className={`text-4xl font-amiri font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>Sacred Timings</h2>
        <p className="text-slate-400 flex items-center justify-center gap-2 text-sm"><MapPin size={16} /> Adjusted for your current horizon</p>
      </div>
      {times && (
        <div className="grid grid-cols-2 gap-6">
          <div className={`p-8 rounded-[2rem] border col-span-2 ${theme === 'dark' ? 'bg-gradient-to-br from-yellow-500/20 to-transparent border-yellow-500/30' : 'bg-white border-yellow-100 shadow-xl'}`}>
            <p className={`text-[10px] font-bold uppercase mb-2 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>Suhoor Ends (Imsak)</p>
            <p className={`text-5xl font-bold font-mono ${theme === 'dark' ? 'text-yellow-100' : 'text-slate-900'}`}>{times.Imsak}</p>
          </div>
          <div className={`p-8 rounded-[2rem] border col-span-2 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/20 to-transparent border-blue-500/30' : 'bg-white border-blue-100 shadow-xl'}`}>
            <p className={`text-[10px] font-bold uppercase mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Iftar (Maghrib)</p>
            <p className={`text-5xl font-bold font-mono ${theme === 'dark' ? 'text-blue-100' : 'text-slate-900'}`}>{times.Maghrib}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Wisdom = ({ theme }: { theme: Theme }) => {
  const [reflection, setReflection] = useState<ReflectionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchReflection = async () => {
    setLoading(true);
    try {
      const res = await generateDailyReflection(Math.floor(Math.random() * 30) + 1);
      setReflection(res);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { handleFetchReflection(); }, []);

  return (
    <div className="pt-8 pb-24 px-4 max-w-2xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className={`text-4xl font-amiri font-bold ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>Soul Nourishment</h2>
        <p className="text-slate-400 text-sm italic">Daily reflections for a more meaningful Ramadan.</p>
      </div>
      {reflection && (
        <div className={`${theme === 'dark' ? 'bg-slate-900/60 border-yellow-500/10' : 'bg-white border-yellow-100 shadow-xl'} p-10 rounded-[3rem] border`}>
          <p className={`text-xl font-amiri leading-relaxed italic ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>"{reflection.thought}"</p>
          <div className={`mt-10 pt-8 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <p className="text-[10px] text-slate-500 font-black uppercase mb-3">Today's Good Deed</p>
            <p className={`leading-relaxed text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{reflection.action}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('ramadan-theme') as Theme) || 'dark');

  useEffect(() => { localStorage.setItem('ramadan-theme', theme); }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const bgClass = theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-[#fffdf7] text-slate-900';

  return (
    <div className={`min-h-screen relative transition-colors duration-700 ${bgClass}`}>
      <FloatingElements theme={theme} />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />
      <main className="relative z-10 md:pt-24 pb-16 min-h-screen flex flex-col">
        {activeTab === 'home' && <Home theme={theme} onStartGreeting={() => setActiveTab('greetings')} setActiveTab={setActiveTab} />}
        {activeTab === 'calendar' && <RamadanCalendar theme={theme} />}
        {activeTab === 'quran' && <QuranReader theme={theme} />}
        {activeTab === 'faith' && <FaithEssentials theme={theme} />}
        {activeTab === 'duas' && <SacredDuas theme={theme} />}
        {activeTab === 'greetings' && <Greetings theme={theme} />}
        {activeTab === 'timings' && <Timings theme={theme} />}
        {activeTab === 'wisdom' && <Wisdom theme={theme} />}
      </main>
      <footer className={`hidden md:block py-16 border-t mt-auto relative z-10 ${theme === 'dark' ? 'border-slate-900 bg-slate-950/50' : 'border-slate-100 bg-white/50'}`}>
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <p className="text-slate-500 font-amiri text-lg italic">"Blessings to Bilal and all who seek light in this holy month."</p>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Ramadan 1447 AH • 2026 CE</p>
        </div>
      </footer>
    </div>
  );
}
