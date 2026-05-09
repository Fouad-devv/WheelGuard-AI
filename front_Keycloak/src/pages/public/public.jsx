import { useKeycloak } from '@react-keycloak/web';
import { MdPrecisionManufacturing, MdBolt, MdBarChart, MdSecurity } from 'react-icons/md';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
    <Icon className="text-4xl text-blue-300 mb-3" />
    <h3 className="text-white font-semibold mb-1">{title}</h3>
    <p className="text-blue-100 text-sm">{desc}</p>
  </div>
);

export const Public = () => {
  const { keycloak } = useKeycloak();

  const handleLogin = () =>
    keycloak.login({ redirectUri: window.location.origin + '/dashboard' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <MdPrecisionManufacturing className="text-blue-400 text-2xl" />
          <span className="text-white font-bold text-xl">
            LumiQuality <span className="text-blue-400">AI</span>
          </span>
        </div>
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
        >
          Se connecter
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 text-xs font-medium px-3 py-1 rounded-full border border-blue-500/30 mb-6">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Industrie 4.0 · Injection plastique · IA
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Prédiction de qualité<br />
          <span className="text-blue-400">en temps réel</span>
        </h1>

        <p className="text-blue-100 text-lg max-w-xl mb-10">
          LumiQuality AI prédit la classe de qualité des lentilles plastiques à partir des paramètres
          machine d'injection, <strong>avant le contrôle photométrique final</strong>.
        </p>

        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-blue-900/50"
        >
          Accéder à la plateforme →
        </button>

        <p className="mt-4 text-blue-300/60 text-xs">
          Connexion via Keycloak SSO · Rôles : Opérateur, Manager, Administrateur
        </p>
      </main>

      {/* Features */}
      <section className="px-8 pb-16 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4">
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
          title="Authentification sécurisée"
          desc="Keycloak SSO avec gestion des rôles opérateur, manager et admin."
        />
      </section>

      <footer className="text-center text-blue-300/40 text-xs pb-6">
        ENSA Béni Mellal · Filière Transformation Digitale Industrielle · 2025-2026
      </footer>
    </div>
  );
};
