import React, { useState, useEffect } from 'react';
import { 
  MemoryStick as Memory, 
  Search, 
  ShoppingCart, 
  UserCircle, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  CloudUpload, 
  Info, 
  Cpu, 
  Sparkles, 
  Zap, 
  Camera, 
  CheckCircle2, 
  MessageSquare, 
  Headphones,
  Tv,
  Lightbulb,
  Speaker,
  Refrigerator,
  MoreHorizontal,
  Snowflake,
  Rocket,
  X,
  Star,
  Twitter,
  Instagram,
  Facebook
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeRoom, RoomAnalysis } from './services/gemini';

type Screen = 'landing' | 'wizard' | 'recommendations';
type ModalType = 'none' | 'how-it-works' | 'products' | 'pricing' | 'reviews' | 'gallery' | 'ai-expert';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [modalType, setModalType] = useState<ModalType>('none');
  const [toast, setToast] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: 'Air Conditioner',
    roomSize: '250 - 350 sq ft',
    budget: 'Premium',
    image: null as string | null
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleStartWizard = () => {
    if (!user) {
      setAuthMode('login');
    } else {
      setScreen('wizard');
    }
  };

  const handleBackToLanding = () => setScreen('landing');
  
  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeRoom(formData);
    setAnalysis(result);
    setLoading(false);
    setScreen('recommendations');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setScreen('landing');
  };

  const showToast = (msg: string) => setToast(msg);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onNavigate={setScreen} 
        currentScreen={screen} 
        user={user} 
        onLogout={handleLogout} 
        onLogin={() => setAuthMode('login')} 
        onOpenModal={setModalType}
      />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {screen === 'landing' && (
            <LandingPage key="landing" onStart={handleStartWizard} onOpenModal={setModalType} />
          )}
          {screen === 'wizard' && (
            <WizardPage 
              key="wizard" 
              onBack={handleBackToLanding} 
              onNext={handleAnalyze}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {screen === 'recommendations' && analysis && (
            <RecommendationsPage 
              key="recommendations" 
              analysis={analysis} 
              onReanalyze={() => setScreen('wizard')}
              roomImage={formData.image}
              onOpenAIExpert={() => setModalType('ai-expert')}
              onShowToast={showToast}
            />
          )}
        </AnimatePresence>
      </main>

      <Footer onOpenModal={setModalType} />

      {/* Auth Modals */}
      <AnimatePresence>
        {authMode && (
          <AuthModal 
            mode={authMode} 
            onClose={() => setAuthMode(null)} 
            onSuccess={(u) => {
              setUser(u);
              setAuthMode(null);
              setScreen('wizard');
            }}
            setMode={setAuthMode}
          />
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <AnimatePresence>
        {modalType !== 'none' && (
          <GlobalModal type={modalType} onClose={() => setModalType('none')} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2"
          >
            <Sparkles className="text-primary size-5" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="relative">
              <div className="size-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Cpu className="absolute inset-0 m-auto text-primary size-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Analyzing Your Space</h3>
              <p className="text-slate-500 mt-2">Our AI is cross-referencing thousands of products with your room's dimensions and style...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar({ onNavigate, currentScreen, user, onLogout, onLogin, onOpenModal }: { 
  onNavigate: (s: Screen) => void, 
  currentScreen: Screen,
  user: any,
  onLogout: () => void,
  onLogin: () => void,
  onOpenModal: (t: ModalType) => void
}) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
            <Memory className="text-white size-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            ElectroSpace <span className="text-primary">AI</span>
          </h2>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          <button onClick={() => onOpenModal('how-it-works')} className="text-sm font-semibold hover:text-primary transition-colors">How it Works</button>
          <button onClick={() => onOpenModal('products')} className="text-sm font-semibold hover:text-primary transition-colors">Products</button>
          <button onClick={() => onOpenModal('pricing')} className="text-sm font-semibold hover:text-primary transition-colors">Pricing</button>
          <button onClick={() => onOpenModal('reviews')} className="text-sm font-semibold hover:text-primary transition-colors">Reviews</button>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('wizard')}
            className="hidden sm:flex bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20"
          >
            Design My Space
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Hi, {user.name}</span>
              <button onClick={onLogout} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Logout</button>
              <div className="size-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden">
                <UserCircle className="text-slate-400 size-8" />
              </div>
            </div>
          ) : (
            <button onClick={onLogin} className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary transition-colors">
              <UserCircle className="size-5" />
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const LandingPage: React.FC<{ onStart: () => void, onOpenModal: (t: ModalType) => void }> = ({ onStart, onOpenModal }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New: AI-Powered Room Analysis
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Smart Electronics. <br/>
              <span className="text-primary">Designed for Your Space.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
              Elevate your living experience. Our AI scans your environment to curate premium electronics that match your room’s dimensions, lighting, and aesthetic perfectly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onStart}
                className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 group shadow-xl shadow-primary/30"
              >
                Design My Space
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onOpenModal('gallery')}
                className="bg-white border border-slate-200 hover:border-primary text-slate-900 px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                View Gallery
              </button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <img 
                    key={i}
                    className="size-10 rounded-full border-2 border-white" 
                    src={`https://picsum.photos/seed/user${i}/100/100`} 
                    alt="User"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-500">Trusted by <span className="text-slate-900 font-bold">12,000+</span> homeowners</p>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] lg:aspect-square">
            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
            <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              <img 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200" 
                alt="Modern Living Room" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest opacity-80">AI Analysis Active</p>
                    <p className="text-lg font-bold">Minimalist Scandi Living</p>
                  </div>
                  <Camera className="text-primary size-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm">Our Process</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Three Simple Steps</h3>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              We take the guesswork out of tech shopping. Our advanced neural engine finds the perfect fit for your lifestyle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              icon={<Upload className="size-8" />} 
              title="1. Upload" 
              desc="Take a few photos of your room. Our AI detects dimensions, furniture placement, and existing aesthetic themes."
            />
            <StepCard 
              icon={<Cpu className="size-8" />} 
              title="2. Analyze" 
              desc="We cross-reference thousands of high-end electronics with your room's specific acoustics, lighting, and size constraints."
            />
            <StepCard 
              icon={<Sparkles className="size-8" />} 
              title="3. Recommend" 
              desc="Receive a curated, interactive lookbook of premium products guaranteed to look and sound incredible in your space."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-slate-900 p-12 md:p-20 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-primary opacity-20 pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-blue-400/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Ready to transform <br/> your living space?
            </h2>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join 12,000+ happy users who have unlocked the full potential of their home with AI-powered recommendations.
            </p>
            <div className="flex justify-center pt-4">
              <button 
                onClick={onStart}
                className="bg-white text-slate-900 hover:bg-slate-100 px-10 py-5 rounded-2xl text-xl font-bold transition-all shadow-2xl flex items-center gap-3"
              >
                Start Your Free Scan
                <Rocket className="size-6" />
              </button>
            </div>
            <p className="text-slate-400 text-sm font-medium">No credit card required. AI analysis takes less than 60 seconds.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function StepCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-3xl bg-background-light border border-transparent hover:border-primary/20 transition-all hover:shadow-xl">
      <div className="size-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-4 text-slate-900">{title}</h4>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

const WizardPage: React.FC<{ 
  onBack: () => void, 
  onNext: () => void,
  formData: any,
  setFormData: any
}> = ({ onBack, onNext, formData, setFormData }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Design My Space</h1>
            <p className="text-slate-500 mt-1">Step 1: Room Details & Preferences</p>
          </div>
          <div className="text-right">
            <span className="text-primary font-bold text-lg leading-none">33%</span>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Completion</p>
          </div>
        </div>
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '33%' }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Upload */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="text-primary size-5" />
              Room Preview
            </h3>
            <label className="relative aspect-[4/3] w-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group cursor-pointer hover:border-primary transition-colors overflow-hidden">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              {formData.image ? (
                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="relative z-10 flex flex-col items-center text-center p-8">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <CloudUpload className="size-8" />
                  </div>
                  <p className="text-slate-900 font-semibold">Drop your room photo here</p>
                  <p className="text-slate-500 text-sm mt-2">Supports JPG, PNG up to 10MB. For best AI results, use a wide-angle shot from a corner.</p>
                  <div className="mt-6 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors">
                    Browse Files
                  </div>
                </div>
              )}
            </label>
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Info className="text-primary size-5 shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our AI will analyze the natural light, wall dimensions, and existing furniture to suggest the perfect electronics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="mb-10">
              <h3 className="text-lg font-bold text-slate-900 mb-6">What are you looking for?</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <CategoryButton 
                  icon={<Snowflake />} 
                  label="Air Conditioner" 
                  selected={formData.category === 'Air Conditioner'} 
                  onClick={() => setFormData({ ...formData, category: 'Air Conditioner' })}
                />
                <CategoryButton 
                  icon={<Tv />} 
                  label="Smart TV" 
                  selected={formData.category === 'Smart TV'} 
                  onClick={() => setFormData({ ...formData, category: 'Smart TV' })}
                />
                <CategoryButton 
                  icon={<Lightbulb />} 
                  label="Smart Lighting" 
                  selected={formData.category === 'Smart Lighting'} 
                  onClick={() => setFormData({ ...formData, category: 'Smart Lighting' })}
                />
                <CategoryButton 
                  icon={<Speaker />} 
                  label="Home Theater" 
                  selected={formData.category === 'Home Theater'} 
                  onClick={() => setFormData({ ...formData, category: 'Home Theater' })}
                />
                <CategoryButton 
                  icon={<Refrigerator />} 
                  label="Appliances" 
                  selected={formData.category === 'Appliances'} 
                  onClick={() => setFormData({ ...formData, category: 'Appliances' })}
                />
                <CategoryButton 
                  icon={<MoreHorizontal />} 
                  label="Other" 
                  selected={formData.category === 'Other'} 
                  onClick={() => setFormData({ ...formData, category: 'Other' })}
                />
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Room Size</h3>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-sm">
                  {formData.roomSize}
                </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  let size = '250 - 350 sq ft';
                  if (val < 25) size = '50 - 150 sq ft';
                  else if (val < 50) size = '150 - 250 sq ft';
                  else if (val < 75) size = '250 - 500 sq ft';
                  else size = '500+ sq ft';
                  setFormData({ ...formData, roomSize: size });
                }}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>50 sq ft</span>
                <span>1000+ sq ft</span>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Budget Preference</h3>
              <div className="grid grid-cols-3 gap-3">
                {['Value', 'Premium', 'Luxury'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setFormData({ ...formData, budget: b })}
                    className={`flex flex-col p-4 rounded-xl border transition-all text-center ${
                      formData.budget === b 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-slate-200 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xs opacity-60 mb-1">
                      {b === 'Value' ? '$' : b === 'Premium' ? '$$' : '$$$'}
                    </span>
                    <span className="text-sm font-bold">{b}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button 
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-500 font-bold hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="size-5" />
                Back
              </button>
              <button 
                onClick={onNext}
                className="flex items-center gap-2 px-10 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue to Recommendations
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryButton({ icon, label, selected, onClick }: { icon: React.ReactNode, label: string, selected: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
        selected 
          ? 'border-primary bg-primary/5 text-primary shadow-md ring-2 ring-primary/20' 
          : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
      }`}
    >
      <div className={selected ? 'text-primary' : 'text-slate-500'}>
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
      <span className={`text-sm ${selected ? 'font-bold' : 'font-medium text-slate-700'}`}>{label}</span>
    </button>
  );
}

const RecommendationsPage: React.FC<{ 
  analysis: RoomAnalysis, 
  onReanalyze: () => void, 
  roomImage: string | null,
  onOpenAIExpert: () => void,
  onShowToast: (msg: string) => void
}> = ({ analysis, onReanalyze, roomImage, onOpenAIExpert, onShowToast }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-slate-500 text-sm font-medium">Home</span>
        <span className="text-slate-300 text-sm font-medium">/</span>
        <span className="text-primary text-sm font-bold">Recommendations</span>
      </div>

      <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight">Personalized Recommendations</h1>
          <p className="text-slate-500 text-lg font-normal">Precision-matched electronics for your unique living environment.</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-[1.5_1.5_0px] flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase">AI Insight</span>
                <span className="text-slate-400 text-xs font-medium">Updated 2 mins ago</span>
              </div>
              <h3 className="text-slate-900 text-xl font-bold">Space Analysis Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <SummaryItem label="Detected Style" value={analysis.style} />
                <SummaryItem label="Wall Palette" value={analysis.palette} />
                <SummaryItem label="Area Size" value={analysis.areaSize} />
                <SummaryItem label="Light Profile" value={analysis.lightProfile} />
              </div>
            </div>
            <button 
              onClick={onReanalyze}
              className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors w-fit"
            >
              <Camera className="size-5" />
              <span>Re-analyze Space Photo</span>
            </button>
          </div>
          <div className="flex-1 min-h-[200px] relative group overflow-hidden rounded-xl border-4 border-white shadow-lg">
            <div className="absolute inset-0 bg-slate-900/20 z-10"></div>
            <img 
              src={roomImage || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800"} 
              alt="Room Scan" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="text-green-500 size-4" />
              <span className="text-xs font-bold">Current Scan</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-slate-900 text-2xl font-bold leading-tight">Top Picks for Your Space</h2>
        <p className="text-slate-500 text-sm mt-1">Our AI predicts these will integrate seamlessly with your room design.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {analysis.recommendations?.map((rec, idx) => (
          <RecommendationCard key={idx} rec={rec} onShowToast={onShowToast} onOpenAIExpert={onOpenAIExpert} />
        ))}
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={onOpenAIExpert}
          className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform"
        >
          <MessageSquare className="size-6" />
          <span className="font-bold">Contact Expert AI</span>
        </button>
      </div>
    </motion.div>
  );
}

function SummaryItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-3 bg-background-light rounded-lg">
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-slate-900 font-semibold text-sm">{value}</p>
    </div>
  );
}

const RecommendationCard: React.FC<{ rec: any, onShowToast: (msg: string) => void, onOpenAIExpert: () => void }> = ({ rec, onShowToast, onOpenAIExpert }) => {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-shadow">
      <div className="relative h-64 overflow-hidden bg-slate-50 flex items-center justify-center p-8">
        <div className="absolute top-4 left-4 z-10 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-full tracking-tighter">
          {rec.type}
        </div>
        <img 
          src={rec.imageUrl} 
          alt={rec.model} 
          className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-primary font-bold text-xs uppercase tracking-widest">{rec.brand}</p>
            <h3 className="text-lg font-bold text-slate-900">{rec.model}</h3>
          </div>
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">
            {rec.energyRating}
          </div>
        </div>
        <div className="flex gap-4 border-y border-slate-100 py-3">
          {rec.specs.map((spec: any, i: number) => (
            <div key={i} className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold">{spec.label}</span>
              <span className="text-sm font-semibold">{spec.value}</span>
            </div>
          ))}
        </div>
        <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
          <p className="text-primary text-[10px] font-bold uppercase mb-1">Why it matches</p>
          <p className="text-xs text-slate-600 leading-relaxed italic">"{rec.matchReason}"</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-2xl font-black text-slate-900">{rec.price}</span>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => onShowToast(`Added ${rec.model} to cart!`)}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Buy Now
          </button>
          <button 
            onClick={onOpenAIExpert}
            className="px-4 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors"
          >
            <MessageSquare className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ mode, onClose, onSuccess, setMode }: { 
  mode: 'login' | 'signup', 
  onClose: () => void, 
  onSuccess: (user: any) => void,
  setMode: (m: 'login' | 'signup') => void
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = mode === 'login' ? { email, password } : { email, password, name };
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        if (mode === 'login') {
          onSuccess(data.user);
        } else {
          setMode('login');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all mt-4"
            >
              {mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="ml-2 text-primary font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Footer({ onOpenModal }: { onOpenModal: (t: ModalType) => void }) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-20 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded flex items-center justify-center">
              <Memory className="text-white size-5" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              ElectroSpace <span className="text-primary">AI</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            The world's first AI-powered smart electronics recommendation engine. Designed for modern living.
          </p>
          <div className="flex gap-4">
            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
              <Twitter className="size-4" />
            </div>
            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
              <Instagram className="size-4" />
            </div>
            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
              <Facebook className="size-4" />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Product</h4>
          <ul className="space-y-4 text-sm">
            <li><button onClick={() => onOpenModal('how-it-works')} className="hover:text-primary transition-colors text-left">How it Works</button></li>
            <li><button onClick={() => onOpenModal('products')} className="hover:text-primary transition-colors text-left">Features</button></li>
            <li><button onClick={() => onOpenModal('pricing')} className="hover:text-primary transition-colors text-left">Pricing</button></li>
            <li><button onClick={() => onOpenModal('reviews')} className="hover:text-primary transition-colors text-left">Testimonials</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Newsletter</h4>
          <p className="text-sm mb-4">Get the latest smart home trends delivered to your inbox.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-primary outline-none"
            />
            <button className="bg-primary text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 text-center text-xs">
        <p>&copy; 2026 ElectroSpace AI. All rights reserved.</p>
      </div>
    </footer>
  );
}

function GlobalModal({ type, onClose }: { 
  type: ModalType, 
  onClose: () => void
}) {
  const renderContent = () => {
    switch (type) {
      case 'how-it-works':
        return (
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-black text-slate-900">How ElectroSpace Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  <h4 className="font-bold text-slate-900">Visual Scanning</h4>
                  <p className="text-sm text-slate-500">Our AI uses computer vision to identify furniture, wall colors, and ambient light levels from your photos.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  <h4 className="font-bold text-slate-900">Neural Matching</h4>
                  <p className="text-sm text-slate-500">We compare your room profile against a database of 50,000+ premium electronics using a custom-trained LLM.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">3</div>
                <div>
                  <h4 className="font-bold text-slate-900">Spatial Layout</h4>
                  <p className="text-sm text-slate-500">The AI calculates optimal placement for speakers, TVs, and smart lighting to maximize performance and style.</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition-colors">Got it!</button>
          </div>
        );
      case 'products':
        return (
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-black text-slate-900">Our Product Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Smart TVs', 'Audio Systems', 'Smart Lighting', 'Home Security', 'Climate Control', 'Kitchen Tech'].map(cat => (
                <div key={cat} className="p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                  <h4 className="font-bold text-slate-900 group-hover:text-primary">{cat}</h4>
                  <p className="text-xs text-slate-500">Curated premium selection</p>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition-colors">Explore All</button>
          </div>
        );
      case 'pricing':
        return (
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-black text-slate-900 text-center">Simple Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border-2 border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-900">Basic Scan</h4>
                <div className="text-3xl font-black text-slate-900">$0 <span className="text-sm font-normal text-slate-400">/ scan</span></div>
                <ul className="text-sm space-y-2 text-slate-500">
                  <li>• 3 Product Recommendations</li>
                  <li>• Basic Style Analysis</li>
                  <li>• Standard Support</li>
                </ul>
                <button className="w-full py-2 border border-slate-200 rounded-lg font-bold hover:bg-slate-50">Current Plan</button>
              </div>
              <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">Popular</div>
                <h4 className="font-bold text-slate-900">Pro Designer</h4>
                <div className="text-3xl font-black text-slate-900">$19 <span className="text-sm font-normal text-slate-400">/ month</span></div>
                <ul className="text-sm space-y-2 text-slate-500">
                  <li>• Unlimited Room Scans</li>
                  <li>• 24/7 AI Expert Chat</li>
                  <li>• Exclusive Discounts</li>
                  <li>• 3D Room Visualizer</li>
                </ul>
                <button className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700">Upgrade Now</button>
              </div>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-black text-slate-900">What People Say</h2>
            <div className="space-y-4">
              {[
                { name: "Sarah J.", text: "The AI matched my living room perfectly. I bought the recommended soundbar and it looks like it was made for my shelf!", rating: 5 },
                { name: "Mark T.", text: "Saved me hours of research. The budget filter is actually accurate.", rating: 5 },
                { name: "Elena R.", text: "Incredible tech. The lighting analysis detected my north-facing windows and suggested the perfect smart bulbs.", rating: 5 }
              ].map((rev, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, j) => <Star key={j} className="size-3 fill-current" />)}
                  </div>
                  <p className="text-sm text-slate-600 italic">"{rev.text}"</p>
                  <p className="text-xs font-bold text-slate-900">— {rev.name}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-black text-slate-900">Design Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img 
                    src={`https://picsum.photos/seed/gallery${i}/400/400`} 
                    alt="Gallery" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition-colors">Close Gallery</button>
          </div>
        );
      case 'ai-expert':
        return (
          <div className="flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center">
                <Cpu className="text-white size-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">ElectroSpace Expert AI</h3>
                <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Online & Ready to Help
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              <div className="flex gap-3 max-w-[80%]">
                <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <Cpu className="text-slate-500 size-4" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700">
                  Hello! I'm your ElectroSpace Expert. I've reviewed your room analysis. How can I help you refine your tech setup today?
                </div>
              </div>
              <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <UserCircle className="text-white size-5" />
                </div>
                <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm">
                  I'm worried about the soundbar fitting on my mantle.
                </div>
              </div>
              <div className="flex gap-3 max-w-[80%]">
                <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <Cpu className="text-slate-500 size-4" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700">
                  Based on your scan, your mantle is 48 inches wide. The recommended Sonos Beam is only 25.6 inches wide, leaving plenty of room for decor! Would you like me to check the depth as well?
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask me anything about your space..." 
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button className="bg-primary text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 size-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <X className="size-5 text-slate-500" />
        </button>
        {renderContent()}
      </motion.div>
    </div>
  );
}
