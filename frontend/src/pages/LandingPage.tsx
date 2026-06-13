
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sofa, BarChart3, Package, Factory, ShoppingCart, ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import api from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-faded-white text-luxury-brown font-sans selection:bg-soft-cream">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-luxury-brown rounded-xl flex items-center justify-center shadow-lg shadow-luxury-brown/10">
            <Sofa className="text-faded-white w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold leading-none">SHIV<span className="text-warm-taupe">FURNITURE</span></span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-taupe mt-1 ml-0.5">Enterprise ERP</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-10 text-[11px] font-semibold uppercase tracking-wider text-warm-taupe">
          <a href="#features" className="hover:text-luxury-brown transition-colors">Operational Modules</a>
          <a href="#solution" className="hover:text-luxury-brown transition-colors">Access Portal</a>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button onClick={() => navigate('/dashboard')} variant="primary" className="px-8 font-semibold">
              Control Panel <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={() => navigate('/login')} className="px-8 shadow-lg shadow-luxury-brown/10 font-semibold">
               Executive Login
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-40 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-soft-cream/50 -skew-x-12 translate-x-20 z-0"></div>
        
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-24 items-center relative z-10">
          <div className="space-y-10 animate-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#e8e4db] text-warm-taupe text-[10px] font-semibold uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Authorized Shiv Furniture Works System
            </div>
            <h1 className="text-7xl md:text-8xl font-bold leading-[0.95] text-luxury-brown">
              Digital <br/>
              <span className="text-warm-taupe underline decoration-luxury-brown/10 underline-offset-8">Craftsmanship</span>.
            </h1>
            <p className="text-lg text-warm-taupe font-medium leading-relaxed max-w-lg">
              Synchronize your entire production line. From artisan assembly to global delivery, manage every inventory movement with luxury precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <Button onClick={() => document.getElementById('solution')?.scrollIntoView({behavior: 'smooth'})} className="h-16 px-10 text-sm font-semibold tracking-wider bg-luxury-brown hover:bg-[#3a2c20]">
                Request Access <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <div className="flex items-center gap-4 px-6 text-warm-taupe">
                 <div className="flex -space-x-3">
                   {[1,2,3].map(i => <div key={i} className={`w-10 h-10 rounded-full border-4 border-faded-white bg-[#d1cbbd]`} />)}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-luxury-brown leading-none">Global Network</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">500+ Active Nodes</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="relative animate-in zoom-in duration-1000 delay-200">
            <div className="absolute -inset-10 bg-luxury-brown/5 rounded-3xl blur-3xl" />
            <div className="relative bg-white rounded-3xl shadow-xl border border-white p-4">
               <img 
                 src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000" 
                 alt="Luxury Furniture Design" 
                 className="w-full h-[600px] object-cover rounded-2xl"
               />
               <div className="absolute inset-4 bg-gradient-to-t from-luxury-brown/60 to-transparent rounded-2xl" />
               <div className="absolute bottom-12 left-12 right-12 text-faded-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Live Production Engine</span>
                  </div>
                  <p className="text-3xl font-bold leading-tight font-serif text-white">"Moving from spreadsheets to this digital spine increased our workshop throughput by 42%."</p>
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-white/50">— Production Director</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 bg-white relative">
        <div className="max-w-7xl mx-auto px-8">
           <div className="flex flex-col items-center text-center mb-24">
             <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-taupe mb-4">Architectural Backbone</span>
             <h2 className="text-5xl font-bold text-luxury-brown max-w-2xl leading-none">A Unified Ecosystem for Master Artisans.</h2>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
             <FeatureCard 
               icon={<Package />} 
               title="Smart Inventory" 
               desc="Advanced tracking with real-time reservation logic and MTO replenishment triggers."
             />
             <FeatureCard 
               icon={<ShoppingCart />} 
               title="Sales Pipeline" 
               desc="Integrated order fulfillment with partial delivery support and delayed order alerts."
             />
             <FeatureCard 
               icon={<Factory />} 
               title="Shop Floor Control" 
               desc="Step-by-step BoM manufacturing with detailed Work Order execution and status tracking."
             />
             <FeatureCard 
               icon={<BarChart3 />} 
               title="Financial Intel" 
               desc="Secure cash flow monitoring, revenue analytics, and end-to-end stock movement ledger."
             />
           </div>
        </div>
      </section>

      {/* Access Request Form */}
      <section id="solution" className="py-40 bg-[#fbfaf8] border-y border-[#e8e4db]">
        <div className="max-w-4xl mx-auto px-8">
           <div className="bg-white p-20 rounded-3xl shadow-xl border border-white relative overflow-hidden">
              {/* Decorative side accent */}
              <div className="absolute top-0 left-0 w-2 h-full bg-luxury-brown"></div>
              
              <div className="text-center mb-16">
                <Sofa className="w-12 h-12 text-luxury-brown mx-auto mb-8 opacity-20" />
                <h2 className="text-4xl font-bold text-luxury-brown mb-4">Secure Resource Access</h2>
                <p className="text-warm-taupe font-medium text-sm max-w-sm mx-auto leading-relaxed">Submit your credentials below to request a secure workspace for your department.</p>
              </div>
              
              <RequestForm />
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-luxury-brown text-faded-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 pb-16 border-b border-white/10">
             <div className="max-w-xs space-y-6">
                <div className="flex items-center gap-3">
                   <Sofa className="w-8 h-8 text-faded-white" />
                   <span className="text-xl font-bold">SHIV FURNITURE</span>
                </div>
                <p className="text-xs text-white/50 leading-loose font-medium">Providing the digital infrastructure for modern furniture manufacturing since 2026. Centralized operations, distributed excellence.</p>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-20">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Company</h4>
                   <ul className="text-xs font-bold space-y-3">
                      <li className="hover:text-warm-taupe cursor-pointer transition-colors">Our Studio</li>
                      <li className="hover:text-warm-taupe cursor-pointer transition-colors">Global Logistics</li>
                      <li className="hover:text-warm-taupe cursor-pointer transition-colors">Craftsmanship</li>
                   </ul>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/30">System</h4>
                   <ul className="text-xs font-bold space-y-3">
                      <li className="hover:text-warm-taupe cursor-pointer transition-colors">Documentation</li>
                      <li className="hover:text-warm-taupe cursor-pointer transition-colors">Admin Panel</li>
                      <li className="hover:text-warm-taupe cursor-pointer transition-colors">API Status</li>
                   </ul>
                </div>
             </div>
          </div>
          
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-[10px] font-semibold uppercase tracking-wider text-white/20">Shiv Furniture Works © 2026 | Private Enterprise System</p>
             <div className="flex gap-8 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                <span className="hover:text-white cursor-pointer">Security Protocol</span>
                <span className="hover:text-white cursor-pointer">Privacy Framework</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-faded-white/50 p-12 rounded-2xl border border-[#f1ede4] hover:border-luxury-brown/20 transition-all duration-500 hover:shadow-xl hover:shadow-luxury-brown/5 group">
    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-10 group-hover:bg-luxury-brown group-hover:text-faded-white transition-all duration-500 border border-[#e8e4db]">
      {React.cloneElement(icon, { className: "w-8 h-8" })}
    </div>
    <h3 className="text-2xl font-bold text-luxury-brown mb-4">{title}</h3>
    <p className="text-warm-taupe leading-relaxed text-sm font-semibold">{desc}</p>
  </div>
);

const RequestForm = () => {
  const [formData, setFormData] = React.useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/requests/submit', formData);
      setSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-20 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in zoom-in duration-700">
         <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
         </div>
         <h3 className="text-2xl font-bold text-emerald-900">Transmission Confirmed</h3>
         <p className="text-emerald-700/70 text-sm mt-3 font-medium px-10">The administrative board will review your request and issue credentials to the provided address.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
       <div className="grid md:grid-cols-2 gap-8">
          <Input 
            label="ARTISAN NAME"
            placeholder="Full Name" 
            value={formData.name}
            onChange={(e: any) => setFormData({...formData, name: e.target.value})}
            required
            className="bg-white"
          />
          <Input 
            label="CORPORATE EMAIL"
            placeholder="Email Address" 
            type="email"
            value={formData.email}
            onChange={(e: any) => setFormData({...formData, email: e.target.value})}
            required
            className="bg-white"
          />
       </div>
       <Input 
          label="COMPANY / DIVISION"
          placeholder="e.g. Shiv Furniture - Sales" 
          value={formData.company}
          onChange={(e: any) => setFormData({...formData, company: e.target.value})}
          required
          className="bg-white"
       />
       <div className="flex flex-col gap-2">
          <label className="text-[10px] font-semibold text-luxury-brown uppercase tracking-wider ml-1">ACCESS JUSTIFICATION</label>
          <textarea 
            placeholder="Specify your department and role..."
            className="w-full px-6 py-4 border border-[#e8e4db] rounded-2xl bg-white focus:ring-4 focus:ring-luxury-brown/5 focus:border-luxury-brown outline-none h-40 text-sm font-semibold transition-all"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            required
          ></textarea>
       </div>
       <Button type="submit" disabled={loading} className="w-full h-16 text-sm font-semibold tracking-wider">
          {loading ? "TRANSMITTING..." : "SUBMIT CREDENTIAL REQUEST"}
       </Button>
    </form>
  );
};

export default LandingPage;
