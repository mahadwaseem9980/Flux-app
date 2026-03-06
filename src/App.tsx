import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  Home, 
  Search, 
  Heart, 
  MessageCircle, 
  ChevronLeft,
  Bookmark,
  Share2,
  MoreVertical,
  User,
  Settings,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  X,
  Send,
  ArrowRight,
  Sparkles,
  Zap,
  RotateCcw,
  Palette,
  Moon,
  Sun,
  Palette as PaletteIcon
} from 'lucide-react';
import { Story, View, StoryComment } from './types';

function GhostScrollbar({ scrollRef }: { scrollRef: React.RefObject<HTMLElement | null> }) {
  const [isVisible, setIsVisible] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fadeTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateScrollbar = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const heightRatio = clientHeight / scrollHeight;
    const topRatio = scrollTop / scrollHeight;

    setThumbHeight(heightRatio * clientHeight);
    setThumbTop(topRatio * clientHeight);

    setIsVisible(true);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    if (!isDragging) {
      fadeTimeout.current = setTimeout(() => setIsVisible(false), 1500);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollbar);
    const observer = new ResizeObserver(updateScrollbar);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollbar);
      observer.disconnect();
    };
  }, [scrollRef, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setIsVisible(true);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);

    const startY = e.clientY;
    const startScrollTop = scrollRef.current?.scrollTop || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      const deltaY = moveEvent.clientY - startY;
      const scrollRatio = el.scrollHeight / el.clientHeight;
      el.scrollTop = startScrollTop + deltaY * scrollRatio;
      
      // Haptic simulation: check for "chapter markers" (every 20% of scroll)
      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      if (Math.abs((progress * 100) % 20) < 1) {
        if ('vibrate' in navigator) navigator.vibrate(5);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      fadeTimeout.current = setTimeout(() => setIsVisible(false), 1500);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="absolute right-1 top-0 bottom-0 w-1 z-50 pointer-events-none">
      <motion.div
        onMouseDown={handleMouseDown}
        animate={{ 
          opacity: isVisible || isDragging ? 0.4 : 0,
          scaleX: isDragging ? 2 : 1
        }}
        transition={{ duration: 0.3 }}
        className="absolute right-0 w-1 bg-primary rounded-full pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{ 
          height: `${thumbHeight}px`, 
          top: `${thumbTop}px`,
          minHeight: '40px'
        }}
      />
    </div>
  );
}

// Mock Data for initial state
const MOCK_STORIES: Story[] = [
  {
    id: '1',
    title: 'The Echoes of Starlight',
    author: 'Aria Vance',
    cover_url: 'https://picsum.photos/seed/star/400/600',
    content: 'The stars didn\'t just shine; they whispered. Elara had spent her whole life listening to the faint hum of the cosmos, a melody only she could hear...',
    category: 'Sci-Fi',
    likes: 1240,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Midnight in Kyoto',
    author: 'Kenji Sato',
    cover_url: 'https://picsum.photos/seed/kyoto/400/600',
    content: 'The rain in Kyoto had a rhythm, a soft tapping on the paper screens that felt like a secret code. In the heart of Gion, a small tea house held a mystery...',
    category: 'Mystery',
    likes: 850,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'The Alchemist\'s Debt',
    author: 'Elena Thorne',
    cover_url: 'https://picsum.photos/seed/alchemy/400/600',
    content: 'Gold was never the goal. It was the transmutation of the soul that mattered. But when the King demanded the impossible, Elena had to choose...',
    category: 'Fantasy',
    likes: 3200,
    created_at: new Date().toISOString()
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'expressive'>('light');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string, visible: boolean } | null>(null);
  const [savedStoryIds, setSavedStoryIds] = useState<string[]>([]);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_saved_stories');
    if (saved) setSavedStoryIds(JSON.parse(saved));
  }, []);

  const toggleSave = (storyId: string) => {
    const newSaved = savedStoryIds.includes(storyId)
      ? savedStoryIds.filter(id => id !== storyId)
      : [...savedStoryIds, storyId];
    setSavedStoryIds(newSaved);
    localStorage.setItem('lumina_saved_stories', JSON.stringify(newSaved));
    
    const isSaving = !savedStoryIds.includes(storyId);
    setSnackbar({ 
      message: isSaving ? "Story saved to bookmarks" : "Story removed from bookmarks", 
      visible: true 
    });
    setTimeout(() => setSnackbar(null), 3000);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('lumina_theme') as any;
    if (savedTheme) setTheme(savedTheme);
    
    const hasSeenOnboarding = localStorage.getItem('lumina_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (data.length > 0) setStories(data);
    } catch (e) {
      console.error("Failed to fetch stories", e);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'theme-expressive');
    if (theme === 'dark') root.classList.add('dark');
    if (theme === 'expressive') root.classList.add('theme-expressive');
    localStorage.setItem('lumina_theme', theme);
  }, [theme]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsNavVisible(false);
    } else {
      setIsNavVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setCurrentView('reader');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row-reverse">
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingView 
            onComplete={() => {
              localStorage.setItem('lumina_onboarding_seen', 'true');
              setShowOnboarding(false);
            }} 
          />
        )}
      </AnimatePresence>

      {/* Profile Menu Overlay */}
      <AnimatePresence>
        {isProfileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileMenuOpen(false)}
              className="fixed inset-0 z-[80] bg-on-surface/10 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: 20, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="fixed top-20 right-6 z-[90] w-72 bg-surface rounded-3xl shadow-elevation-12 border border-on-surface/5 overflow-hidden"
            >
              <div className="p-6 flex flex-col items-center text-center border-b border-on-surface/5">
                <div className="w-20 h-20 clip-squircle bg-primary-container mb-4 overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-display font-bold">Felix Vance</h3>
                <p className="text-sm text-on-surface-variant mb-3">felix.vance@lumina.com</p>
                <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                  View Profile <ExternalLink size={14} />
                </button>
              </div>
              
              <div className="p-2">
                <MenuAction icon={<User size={18} />} label="Account Details" onClick={() => { setIsProfileMenuOpen(false); setCurrentView('home'); }} />
                <MenuAction icon={<Settings size={18} />} label="Settings" onClick={() => { setIsProfileMenuOpen(false); setIsSettingsOpen(true); }} />
                <MenuAction icon={<RotateCcw size={18} />} label="Reload Tutorial" onClick={() => { setIsProfileMenuOpen(false); setShowOnboarding(true); }} />
                <div className="h-px bg-on-surface/5 my-2 mx-4" />
                <MenuAction icon={<MessageSquare size={18} />} label="Feedback" onClick={() => { setIsProfileMenuOpen(false); setIsFeedbackOpen(true); }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Bottom Sheet Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 z-[100] bg-on-surface/20 backdrop-blur-sm"
            />
            <SettingsBottomSheet 
              currentTheme={theme}
              onThemeChange={setTheme}
              onClose={() => setIsSettingsOpen(false)} 
            />
          </>
        )}
      </AnimatePresence>

      {/* Feedback Bottom Sheet Overlay */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackOpen(false)}
              className="fixed inset-0 z-[100] bg-on-surface/20 backdrop-blur-sm"
            />
            <FeedbackBottomSheet 
              onClose={() => setIsFeedbackOpen(false)} 
              onSuccess={() => {
                setIsFeedbackOpen(false);
                setSnackbar({ message: "Feedback sent! Thank you.", visible: true });
                setTimeout(() => setSnackbar(null), 4000);
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Snackbar */}
      <AnimatePresence>
        {snackbar?.visible && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[110] bg-on-surface text-surface px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 min-w-[320px] justify-between"
          >
            <span className="text-sm font-medium">{snackbar.message}</span>
            <button className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-surface/10 px-2 py-1 rounded-lg transition-colors">
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden h-screen" onScroll={handleScroll}>
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <HomeView 
              key="home" 
              stories={stories} 
              onStoryClick={handleStoryClick} 
              onScroll={handleScroll} 
              onProfileClick={() => setIsProfileMenuOpen(true)}
              onRefresh={fetchStories}
            />
          )}
          {currentView === 'reader' && selectedStory && (
            <ReaderView 
              key="reader" 
              story={selectedStory} 
              onBack={() => setCurrentView('home')} 
              isSaved={savedStoryIds.includes(selectedStory.id)}
              onToggleSave={toggleSave}
            />
          )}
          {currentView === 'community' && (
            <CommunityView 
              key="community" 
              onScroll={handleScroll} 
              onRefresh={async () => {
                await new Promise(r => setTimeout(r, 1500));
                setSnackbar({ message: "Community feed updated!", visible: true });
                setTimeout(() => setSnackbar(null), 4000);
              }}
            />
          )}
          {currentView === 'saved' && (
            <SavedView 
              key="saved" 
              stories={stories} 
              savedIds={savedStoryIds}
              onStoryClick={handleStoryClick}
              onScroll={handleScroll}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Floating Taskbar (Floating Bottom App Bar) */}
      <motion.div 
        animate={{ y: isNavVisible ? 0 : 120 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-end gap-4"
      >
        {/* Large FAB for Saved */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentView('saved')}
          className="w-16 h-16 rounded-3xl bg-primary text-on-primary flex items-center justify-center shadow-elevation-12"
        >
          <Bookmark size={32} />
        </motion.button>

        {/* Floating Nav Pill */}
        <nav className="h-16 px-6 bg-surface-variant/60 backdrop-blur-2xl border border-on-surface/5 rounded-full flex items-center gap-8 shadow-elevation-8">
          <NavButton 
            active={currentView === 'home'} 
            onClick={() => setCurrentView('home')} 
            icon={<Home size={24} />} 
            label="Home" 
          />
          <NavButton 
            active={currentView === 'community'} 
            onClick={() => setCurrentView('community')} 
            icon={<Users size={24} />} 
            label="Community" 
          />
          <NavButton 
            active={currentView === 'saved'} 
            onClick={() => setCurrentView('saved')} 
            icon={<Bookmark size={24} />} 
            label="Saved" 
          />
        </nav>
      </motion.div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 group relative transition-all ${active ? 'text-primary' : 'text-on-surface-variant'}`}
    >
      <div className={`p-2 rounded-full transition-all ${active ? 'bg-primary-container text-on-primary-container' : 'group-hover:bg-on-surface/5'}`}>
        {icon}
      </div>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
        />
      )}
    </motion.button>
  );
}

function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void>, children: React.ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 80;

  const handleDrag = (event: any, info: any) => {
    if (isRefreshing) return;
    const distance = Math.max(0, info.offset.y);
    setPullDistance(distance);
  };

  const handleDragEnd = async (event: any, info: any) => {
    if (isRefreshing) return;
    const distance = info.offset.y;
    if (distance > PULL_THRESHOLD) {
      setIsRefreshing(true);
      if ('vibrate' in navigator) navigator.vibrate(10);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="h-full"
      >
        <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50">
          <motion.div
            style={{ 
              y: isRefreshing ? 40 : Math.min(pullDistance * 0.5, 60),
              opacity: isRefreshing ? 1 : Math.min(pullDistance / PULL_THRESHOLD, 1),
              scale: isRefreshing ? 1 : Math.min(pullDistance / PULL_THRESHOLD, 1)
            }}
            className="w-10 h-10 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center"
          >
            {isRefreshing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full"
              />
            ) : (
              <RotateCcw size={20} style={{ transform: `rotate(${pullDistance * 2}deg)` }} />
            )}
          </motion.div>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function HomeView({ stories, onStoryClick, onScroll, onProfileClick, onRefresh }: { 
  stories: Story[], 
  onStoryClick: (s: Story) => void,
  onScroll: (e: React.UIEvent<HTMLElement>) => void,
  onProfileClick: () => void,
  onRefresh: () => Promise<void>,
  key?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <motion.div 
        ref={scrollRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onScroll={onScroll}
        className="h-full overflow-y-auto pb-32 px-6 pt-8 no-scrollbar overscroll-stretch relative"
      >
        <GhostScrollbar scrollRef={scrollRef} />
        {/* Search Bar Anchored Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl">Lumina Reading</h1>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onProfileClick}
              className="w-12 h-12 clip-squircle bg-secondary-container overflow-hidden shadow-md"
            >
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
            </motion.button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
            <input 
              type="text" 
              placeholder="Search stories, authors, or genres..."
              className="w-full h-14 bg-surface-variant/50 rounded-full pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </header>

        {/* Featured Section */}
        <section className="mb-10">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            Recommended for you
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {stories.map(story => (
              <StoryCard key={story.id} story={story} onClick={() => onStoryClick(story)} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-10">
          <h2 className="text-xl mb-4">Explore Genres</h2>
          <div className="grid grid-cols-2 gap-3">
            {['Fantasy', 'Romance', 'Mystery', 'Sci-Fi', 'Horror', 'Non-Fiction'].map(genre => (
              <div key={genre} className="h-20 rounded-2xl bg-tertiary-container/30 border border-tertiary-container/50 flex items-center justify-center font-medium text-on-tertiary-container hover:bg-tertiary-container/50 transition-all cursor-pointer">
                {genre}
              </div>
            ))}
          </div>
        </section>
      </motion.div>
    </PullToRefresh>
  );
}

function StoryCard({ story, onClick }: { story: Story, onClick: () => void, key?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="min-w-[160px] cursor-pointer group"
    >
      <div className="aspect-[2/3] rounded-asymmetric overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-all duration-300">
        <img 
          src={story.cover_url} 
          alt={story.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <h3 className="text-sm font-semibold line-clamp-1">{story.title}</h3>
      <p className="text-xs text-on-surface-variant">{story.author}</p>
    </motion.div>
  );
}

function ReaderView({ story, onBack, isSaved, onToggleSave }: { 
  story: Story, 
  onBack: () => void, 
  isSaved: boolean,
  onToggleSave: (id: string) => void,
  key?: string 
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(story.likes);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const lastScrollY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLike = () => {
    if (!isLiked) {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
    } else {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsNavVisible(false);
    } else {
      setIsNavVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  // Mock splitting content into pages
  const pages = [
    {
      title: story.title,
      content: story.content,
      isFirst: true
    },
    {
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
      content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris."
    },
    {
      content: "Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi."
    }
  ];

  const paginate = (newDirection: number) => {
    const nextPage = currentPage + newDirection;
    if (nextPage >= 0 && nextPage < pages.length) {
      setDirection(newDirection);
      setCurrentPage(nextPage);
    }
  };

  const pageVariants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
      x: direction > 0 ? 100 : -100,
    }),
    center: {
      zIndex: 1,
      rotateY: 0,
      opacity: 1,
      x: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      rotateY: direction < 0 ? 90 : -90,
      opacity: 0,
      x: direction < 0 ? 100 : -100,
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface z-[60] flex flex-col overflow-hidden"
      style={{ perspective: "1500px" }}
    >
      {/* Reader Header */}
      <header className="h-16 px-4 flex items-center justify-between border-b border-on-surface/5 bg-surface z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-on-surface/5">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h3 className="text-sm font-bold line-clamp-1">{story.title}</h3>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Page {currentPage + 1} of {pages.length}</p>
        </div>
        <button className="p-2 rounded-full hover:bg-on-surface/5">
          <MoreVertical size={24} />
        </button>
      </header>

      {/* Reader Content - Flip-able Pages */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-12" onScroll={handleScroll}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              rotateY: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                paginate(1);
              } else if (swipe > 10000) {
                paginate(-1);
              }
            }}
            className="absolute w-full max-w-2xl h-[80vh] bg-surface-variant/10 rounded-3xl p-8 md:p-12 shadow-2xl border border-on-surface/5 flex flex-col backface-hidden"
            style={{ 
              transformOrigin: direction > 0 ? "left center" : "right center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
            }}
          >
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto no-scrollbar overscroll-stretch relative" 
              onScroll={handleScroll}
            >
              <GhostScrollbar scrollRef={scrollRef} />
              {pages[currentPage].isFirst && (
                <h1 className="text-4xl md:text-5xl mb-8 leading-tight font-display">{pages[currentPage].title}</h1>
              )}
              <div className="prose prose-lg md:prose-xl text-on-surface/90 leading-relaxed space-y-6 font-serif">
                <p className="first-letter:text-5xl first-letter:font-display first-letter:mr-3 first-letter:float-left first-letter:text-primary">
                  {pages[currentPage].content}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between items-center text-[10px] text-on-surface-variant uppercase tracking-widest border-t border-on-surface/5 pt-4">
              <span>{story.category}</span>
              <span>{currentPage + 1} / {pages.length}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Clickable areas for navigation */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1/6 cursor-pointer z-20" 
          onClick={() => paginate(-1)}
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/6 cursor-pointer z-20" 
          onClick={() => paginate(1)}
        />
      </div>

      {/* Reader Controls */}
      <motion.footer 
        animate={{ y: isNavVisible ? 0 : 100 }}
        className="h-20 px-6 bg-surface-variant/20 backdrop-blur-md border-t border-on-surface/5 flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-6">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex flex-col items-center gap-1 transition-colors ${isLiked ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <motion.div
              animate={{ scale: isLiked ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            </motion.div>
            <span className="text-[10px] font-bold">{likesCount}</span>
          </motion.button>
          <button 
            onClick={() => setIsCommentsOpen(true)}
            className="flex flex-col items-center gap-1 text-on-surface-variant"
          >
            <MessageCircle size={20} />
            <span className="text-[10px]">42</span>
          </button>
        </div>
        
        {/* Progress Slider Simulation */}
        <div className="flex-1 mx-8 h-1 bg-on-surface/10 rounded-full relative overflow-hidden">
          <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-primary"
            animate={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onToggleSave(story.id)}
            className={`p-3 rounded-2xl transition-all ${isSaved ? 'bg-primary text-on-primary shadow-lg' : 'bg-primary-container text-on-primary-container'}`}
          >
            <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button className="p-3 rounded-2xl bg-secondary-container text-on-secondary-container">
            <Share2 size={20} />
          </button>
        </div>
      </motion.footer>

      <AnimatePresence>
        {isCommentsOpen && (
          <CommentsBottomSheet 
            storyId={story.id} 
            onClose={() => setIsCommentsOpen(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OnboardingView({ onComplete }: { onComplete: () => void }) {
  const [page, setPage] = useState(0);
  
  const screens = [
    {
      title: "Your Library, Reimagined.",
      description: "Experience the world's most expressive ePub engine. Clean, fast, and beautiful.",
      color: "bg-primary-container",
      accent: "text-primary",
      icon: <BookOpen size={120} />,
      lottie: "Flipping Book Animation"
    },
    {
      title: "Connect through Stories.",
      description: "Join a global community of readers and authors. Share thoughts in every chapter.",
      color: "bg-secondary-container",
      accent: "text-secondary",
      icon: <Users size={120} />,
      lottie: "Pulsing Heart Animation"
    },
    {
      title: "Keep What You Love.",
      description: "Save your favorite stories to your personal library with a single tap. Never lose a masterpiece again.",
      color: "bg-tertiary-container",
      accent: "text-tertiary",
      icon: <Bookmark size={120} />,
      lottie: "Floating Bookmark Animation"
    }
  ];

  const next = () => {
    if (page < screens.length - 1) setPage(page + 1);
    else onComplete();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-surface overflow-hidden flex flex-col"
    >
      {/* Morphing Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: page === 0 ? -100 : page === 1 ? 100 : 0,
            y: page === 0 ? -100 : page === 1 ? 200 : -200,
            backgroundColor: page === 0 ? "#D0BCFF" : page === 1 ? "#CCC2DC" : "#EFB8C8"
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: page === 0 ? 300 : page === 1 ? -200 : 400,
            y: page === 0 ? 400 : page === 1 ? -100 : 500,
            backgroundColor: page === 0 ? "#EADDFF" : page === 1 ? "#E8DEF8" : "#FFD8E4"
          }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
        />
      </div>

      {/* Content Pager */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className={`w-64 h-64 rounded-asymmetric ${screens[page].color} flex items-center justify-center mb-12 shadow-2xl elevation-12`}>
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className={screens[page].accent}
              >
                {screens[page].icon}
              </motion.div>
            </div>
            
            <h1 className="text-4xl font-display font-bold mb-6 leading-tight">
              {screens[page].title}
            </h1>
            <p className="text-lg text-on-surface-variant max-w-sm leading-relaxed">
              {screens[page].description}
            </p>
            
            <div className="mt-4 text-[10px] uppercase tracking-widest font-bold text-primary/40">
              {screens[page].lottie}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer with Worm Indicator & CTA */}
      <footer className="p-12 flex flex-col items-center gap-12 z-10">
        {/* Worm Indicator */}
        <div className="flex gap-3 items-center h-4">
          {screens.map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                width: page === i ? 32 : 8,
                backgroundColor: page === i ? "#6750A4" : "#EADDFF"
              }}
              className="h-2 rounded-full transition-all duration-500"
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          layout
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={next}
          className={`h-16 flex items-center justify-center gap-3 font-bold transition-all duration-500 shadow-elevation-12 ${
            page === screens.length - 1 
            ? 'w-full max-w-xs rounded-full bg-primary text-on-primary px-8' 
            : 'w-16 rounded-3xl bg-primary-container text-on-primary-container'
          }`}
        >
          <AnimatePresence mode="wait">
            {page === screens.length - 1 ? (
              <motion.div 
                key="start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                Get Started <Sparkles size={20} />
              </motion.div>
            ) : (
              <motion.div 
                key="next"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <ArrowRight size={28} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </footer>
    </motion.div>
  );
}

function CommentsBottomSheet({ storyId, onClose }: { storyId: string, onClose: () => void }) {
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Mock fetching comments
    const mockComments: StoryComment[] = [
      { id: '1', story_id: storyId, user_name: 'Alice', content: 'This is such a great story!', created_at: new Date().toISOString() },
      { id: '2', story_id: storyId, user_name: 'Bob', content: 'I love the character development.', created_at: new Date().toISOString() },
      { id: '3', story_id: storyId, user_name: 'Charlie', content: 'Can\'t wait for the next chapter!', created_at: new Date().toISOString() },
    ];
    setComments(mockComments);
  }, [storyId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    const comment: StoryComment = {
      id: Math.random().toString(36).substr(2, 9),
      story_id: storyId,
      user_name: 'You',
      content: newComment,
      created_at: new Date().toISOString(),
    };
    setComments([comment, ...comments]);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 bottom-0 z-[100] bg-surface rounded-t-[40px] shadow-2xl flex flex-col max-h-[80vh]"
    >
      <div className="w-12 h-1.5 bg-on-surface/10 rounded-full mx-auto mt-4 mb-6" onClick={onClose} />
      
      <div className="px-8 flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold">Comments</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-on-surface/5">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 space-y-6 pb-24 no-scrollbar">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {comment.user_name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">{comment.user_name}</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-surface/80 backdrop-blur-xl border-t border-on-surface/5 flex gap-3">
        <input 
          type="text" 
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 h-12 bg-surface-variant/50 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSubmit}
          disabled={isSubmitting || !newComment.trim()}
          className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

function MenuAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-on-surface/5 text-on-surface-variant transition-colors"
    >
      <div className="text-primary">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}

function SettingsBottomSheet({ currentTheme, onThemeChange, onClose }: { currentTheme: string, onThemeChange: (t: any) => void, onClose: () => void }) {
  const themes = [
    { id: 'light', label: 'Light', icon: <Sun size={20} />, color: 'bg-[#FEF7FF]' },
    { id: 'dark', label: 'Dark', icon: <Moon size={20} />, color: 'bg-[#141218]' },
    { id: 'expressive', label: 'Expressive', icon: <PaletteIcon size={20} />, color: 'bg-[#201A19]' },
  ];

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-[101] bg-surface rounded-t-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
    >
      <div className="w-full flex justify-center py-4">
        <div className="w-12 h-1.5 bg-on-surface/10 rounded-full" />
      </div>

      <div className="px-6 pb-12">
        <h2 className="text-2xl font-display font-bold mb-8 text-center">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 px-2">Appearance</p>
            <div className="grid grid-cols-1 gap-3">
              {themes.map((t) => (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onThemeChange(t.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    currentTheme === t.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-on-surface/5 bg-surface-variant/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.color} shadow-sm border border-on-surface/5`}>
                      <div className={currentTheme === t.id ? 'text-primary' : 'text-on-surface-variant'}>
                        {t.icon}
                      </div>
                    </div>
                    <span className={`font-medium ${currentTheme === t.id ? 'text-primary' : 'text-on-surface'}`}>
                      {t.label}
                    </span>
                  </div>
                  {currentTheme === t.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-on-primary" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full h-14 bg-on-surface text-surface rounded-full font-bold mt-12 shadow-lg"
        >
          Done
        </motion.button>
      </div>
    </motion.div>
  );
}

function FeedbackBottomSheet({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const sentiments = [
    { emoji: '😠', label: 'Very Dissatisfied' },
    { emoji: '🙁', label: 'Dissatisfied' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '🙂', label: 'Satisfied' },
    { emoji: '🤩', label: 'Very Satisfied' },
  ];

  const categories = ["Bug Report", "Feature Request", "Story Content", "UI/UX"];

  const handleSubmit = async () => {
    if (!sentiment || !category || !text) return;
    setIsSubmitting(true);
    
    // Simulate Firebase call with metadata
    const metadata = {
      device: "Web Simulator",
      version: "2.1.0-expressive",
      uid: "user_7782",
      timestamp: new Date().toISOString()
    };
    
    console.log("Sending Feedback to Firestore:", { sentiment, category, text: text.trim(), ...metadata });
    
    await new Promise(r => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSent(true);
    
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-[101] bg-surface rounded-t-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
    >
      {/* Handle */}
      <div className="w-full flex justify-center py-4">
        <div className="w-12 h-1.5 bg-on-surface/10 rounded-full" />
      </div>

      <div className="px-6 pb-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!isSent ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2">How's your experience?</h2>
                <p className="text-sm text-on-surface-variant">Your feedback helps us build a better community.</p>
              </div>

              {/* Sentiment Icons */}
              <div className="flex justify-between items-center px-4">
                {sentiments.map((s, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ 
                      scale: sentiment === i ? 1.3 : 1,
                      filter: sentiment === i ? 'grayscale(0%)' : 'grayscale(100%)',
                      opacity: sentiment === i ? 1 : 0.6
                    }}
                    onClick={() => setSentiment(i)}
                    className="text-4xl transition-all"
                  >
                    {s.emoji}
                  </motion.button>
                ))}
              </div>

              {/* Category Chips */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Feedback Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        category === cat 
                        ? 'bg-primary text-on-primary border-primary shadow-md' 
                        : 'bg-surface border-on-surface/10 text-on-surface-variant hover:bg-on-surface/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    placeholder="Tell us more about your experience..."
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 500))}
                    className="w-full h-32 bg-surface-variant/20 border-2 border-on-surface/5 rounded-3xl p-4 focus:outline-none focus:border-primary/50 transition-all resize-none text-on-surface"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-mono text-on-surface-variant">
                    {text.length}/500
                  </div>
                </div>
                <p className="text-[10px] text-on-surface-variant italic px-2">
                  * Please be as descriptive as possible. We appreciate your honesty!
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!sentiment || !category || !text || isSubmitting}
                onClick={handleSubmit}
                className="w-full h-14 bg-primary text-on-primary rounded-full font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-on-primary/30 border-t-on-primary rounded-full"
                  />
                ) : (
                  <>
                    <Send size={20} />
                    Submit Feedback
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-6"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary"
              >
                <CheckCircle2 size={64} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-display font-bold mb-2">Feedback Received!</h2>
                <p className="text-sm text-on-surface-variant">Your voice makes Lumina better. <br/>We're flying your message to our team!</p>
              </div>
              
              {/* Flying Plane Animation Simulation */}
              <motion.div 
                animate={{ 
                  x: [0, 100, 200], 
                  y: [0, -50, -100], 
                  opacity: [1, 1, 0],
                  scale: [1, 1.2, 0.5]
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary"
              >
                <Send size={32} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SavedView({ stories, savedIds, onStoryClick, onScroll }: { 
  stories: Story[], 
  savedIds: string[], 
  onStoryClick: (s: Story) => void,
  onScroll: (e: React.UIEvent<HTMLElement>) => void,
  key?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedStories = stories.filter(s => savedIds.includes(s.id));

  return (
    <motion.div 
      ref={scrollRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onScroll={onScroll}
      className="h-full p-6 overflow-y-auto pb-32 no-scrollbar overscroll-stretch relative"
    >
      <GhostScrollbar scrollRef={scrollRef} />
      <h1 className="text-3xl mb-8">Saved Stories</h1>
      
      {savedStories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant opacity-50">
          <Bookmark size={64} className="mb-4" />
          <p>No stories saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {savedStories.map(story => (
            <motion.div 
              key={story.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStoryClick(story)}
              className="flex gap-4 p-4 rounded-3xl bg-surface-variant/20 border border-on-surface/5 cursor-pointer"
            >
              <div className="w-24 h-32 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                <img src={story.cover_url} alt={story.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-1">{story.title}</h3>
                <p className="text-sm text-on-surface-variant mb-2">by {story.author}</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    {story.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CommunityView({ onScroll, onRefresh }: { onScroll: (e: React.UIEvent<HTMLElement>) => void, onRefresh: () => Promise<void>, key?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <motion.div 
        ref={scrollRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onScroll={onScroll}
        className="h-full p-6 overflow-y-auto pb-32 no-scrollbar overscroll-stretch relative"
      >
        <GhostScrollbar scrollRef={scrollRef} />
        <h1 className="text-3xl mb-8">Community</h1>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-3xl bg-surface-variant/30 border border-on-surface/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20" />
                <div>
                  <h4 className="font-bold text-sm">User_{i}00</h4>
                  <p className="text-xs text-on-surface-variant">2 hours ago</p>
                </div>
              </div>
              <p className="text-sm mb-4">Just finished reading "The Alchemist's Debt" and I'm absolutely blown away! The character development is incredible. Anyone else have thoughts on the ending?</p>
              <div className="flex items-center gap-4 text-on-surface-variant">
                <button className="flex items-center gap-1 text-xs">
                  <Heart size={16} /> 24
                </button>
                <button className="flex items-center gap-1 text-xs">
                  <MessageCircle size={16} /> 12
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </PullToRefresh>
  );
}

