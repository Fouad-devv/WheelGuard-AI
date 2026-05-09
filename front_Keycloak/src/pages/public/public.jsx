import { useKeycloak } from '@react-keycloak/web';
import { MdPrecisionManufacturing, MdBolt, MdBarChart, MdSecurity, MdChevronRight } from 'react-icons/md';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center text-center p-5 sm:p-6 bg-white/8 rounded-2xl backdrop-blur-sm border border-white/12 hover:bg-white/12 transition-colors">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(99,102,241,0.3)' }}>
      <Icon className="text-2xl text-blue-300" />
    </div>
    <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">{title}</h3>
    <p className="text-blue-200/80 text-xs sm:text-sm leading-relaxed">{desc}</p>
  </div>
);

export const Public = () => {
  const { keycloak } = useKeycloak();
  const handleLogin  = () => keycloak.login({ redirectUri: window.location.origin + '/dashboard' });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0c1023 0%, #0f172a 40%, #1a1040 100%)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
            <MdPrecisionManufacturing className="text-white text-base" />
          </div>
          <span className="text-white font-bold text-lg sm:text-xl">
            LumiQuality <span style={{ color: '#818cf8' }}>AI</span>
          </span>
        </div>
        <button
          onClick={handleLogin}
          className="flex items-center gap-1.5 text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
        >
          Se connecter <MdChevronRight className="text-base" />
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-8 py-12 sm:py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 text-blue-300 text-xs font-medium px-3.5 py-1.5 rounded-full border border-blue-500/30 mb-6 sm:mb-8"
          style={{ background: 'rgba(59,130,246,0.12)' }}>
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Industrie 4.0 · Injection plastique · Intelligence Artificielle
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight max-w-3xl">
          Prédiction de qualité<br />
          <span style={{ background: 'linear-gradient(90deg, #3b82f6, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            en temps réel
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-blue-200/80 text-sm sm:text-lg max-w-xl mb-8 sm:mb-12 leading-relaxed">
          LumiQuality AI prédit la classe de qualité des lentilles plastiques à partir des{' '}
          <strong className="text-blue-200">13 paramètres machine</strong> d'injection,{' '}
          avant le contrôle photométrique final.
        </p>

        {/* CTA */}
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 text-white font-semibold px-7 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base transition-all hover:scale-105 active:scale-95 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 8px 32px rgba(99,102,241,0.5)' }}
        >
          Accéder à la plateforme
          <MdChevronRight className="text-xl" />
        </button>

        <p className="mt-4 text-blue-300/50 text-xs">
          Connexion sécurisée via Keycloak SSO
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-10 sm:mt-14">
          {[
            { val: '13', label: 'Paramètres machine' },
            { val: '4',  label: 'Classes de qualité' },
            { val: '< 2s', label: 'Temps de réponse' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{val}</p>
              <p className="text-blue-300/60 text-xs sm:text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Features */}
      <section className="px-5 sm:px-8 pb-12 sm:pb-16 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Feature
            icon={MdBolt}
            title="Prédiction instantanée"
            desc="Résultat en moins de 2 secondes après saisie des 13 paramètres machine."
          />
          <Feature
            icon={MdBarChart}
            title="Dashboard analytique"
            desc="KPI en temps réel, répartition des classes, tendances hebdomadaires."
          />
          <Feature
            icon={MdSecurity}
            title="Accès sécurisé"
            desc="Keycloak SSO avec rôles opérateur, manager et administrateur."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-blue-300/30 text-xs pb-5 px-4">
        ENSA Béni Mellal · Filière Transformation Digitale Industrielle · 2025-2026
      </footer>
    </div>
  );
};
