/**
 * CumpreAi OS v2 - Route Engine & Sub-Page Router
 * Handles hash-based client routing, route guards, URL state, and sub-page loading.
 */

class CumpreAiRouter {
  constructor() {
    this.routes = {
      '/auth/login': { title: 'Autenticação', screenId: 'screen-login', subpage: 'pages/auth/login.html' },
      '/auth/onboarding': { title: 'Onboarding Real', screenId: 'screen-onboarding', subpage: 'pages/auth/onboarding.html' },
      '/membro/entrada': { title: 'Módulo 1 - Entrada', screenId: 'screen-home', moduleNum: 1, subpage: 'pages/membro/entrada.html' },
      '/membro/missao': { title: 'Módulo 2 - Missão', screenId: 'screen-home', moduleNum: 2, subpage: 'pages/membro/missao.html' },
      '/membro/operacao': { title: 'Módulo 3 - Operação', screenId: 'screen-home', moduleNum: 3, subpage: 'pages/membro/operacao.html' },
      '/membro/patrimonio': { title: 'Módulo 4 - Patrimônio', screenId: 'screen-home', moduleNum: 4, subpage: 'pages/membro/patrimonio.html' },
      '/membro/ecossistema': { title: 'Módulo 5 - Ecossistema', screenId: 'screen-home', moduleNum: 5, subpage: 'pages/membro/ecossistema.html' },
      '/membro/performance': { title: 'Módulo Performance & Esportes', screenId: 'screen-home', subpage: 'pages/membro/performance.html' },
      '/membro/ligas': { title: 'Ligas & Equipes', screenId: 'screen-home', subpage: 'pages/membro/ligas.html' },
      '/gestao/master': { title: 'Módulo 6 - Master User Global', screenId: 'screen-home', moduleNum: 6, roleView: 'master', subpage: 'pages/gestao/master.html' },
      '/gestao/org': { title: 'Módulo 6 - Gestor de Organização', screenId: 'screen-home', moduleNum: 6, roleView: 'org', subpage: 'pages/gestao/org.html' },
      '/membro/perfil': { title: 'Módulo 7 - Perfil & Configurações', screenId: 'screen-home', moduleNum: 7, subpage: 'pages/membro/perfil.html' },
      '/marketplace': { title: 'Marketplace MVP', screenId: 'screen-marketplace', subpage: 'pages/marketplace.html' },
      '/comms': { title: 'Central de Comunicação', screenId: 'screen-comms', subpage: 'pages/comms.html' },
      '/explore': { title: 'Explorar Oportunidades', screenId: 'screen-explore', subpage: 'pages/explore.html' },
      '/create': { title: 'Criar Compromisso', screenId: 'screen-create', subpage: 'pages/create.html' }
    };

    this.currentPath = null;
    this.initListeners();
  }

  initListeners() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('DOMContentLoaded', () => this.handleRoute());
  }

  /**
   * Navigate programmatically to a sub-page route path
   * @param {string} path - E.g. '/membro/patrimonio' or '/gestao/master'
   */
  navigate(path) {
    if (!path.startsWith('/')) path = '/' + path;
    window.location.hash = '#' + path;
  }

  /**
   * Parse current location.hash and execute sub-page route transition
   */
  handleRoute() {
    let hash = window.location.hash.replace(/^#/, '');
    if (!hash || hash === '/') {
      // Default initial route based on authentication state
      if (window.state && window.state.member && window.state.member.email) {
        if (window.state.member.memberType === 'superadmin') {
          hash = '/gestao/master';
        } else if (window.state.member.memberType === 'organization') {
          hash = '/gestao/org';
        } else {
          hash = '/membro/entrada';
        }
      } else {
        hash = '/auth/login';
      }
    }

    // Ensure leading slash
    if (!hash.startsWith('/')) hash = '/' + hash;

    const routeConfig = this.routes[hash] || this.routes['/auth/login'];
    this.currentPath = hash;

    // Security Route Guard: Redirect unauthenticated users attempting protected sub-pages
    const isPublicRoute = hash.startsWith('/auth');
    const isAuthenticated = window.state && window.state.member && window.state.member.email && window.state.member.memberType !== 'guest';

    if (!isPublicRoute && !isAuthenticated) {
      if (typeof logSystem === 'function') {
        logSystem(`ROUTE GUARD REJECTED: Unauthenticated access attempt to route ${hash}`);
      }
      this.navigate('/auth/login');
      return;
    }

    if (typeof logSystem === 'function') {
      logSystem(`SUB-PAGE ROUTE: Transitioned to sub-page route [${hash}] (${routeConfig.title})`);
    }

    // Activate target screen/module UI in app
    if (routeConfig.screenId && typeof showScreen === 'function') {
      const targetScreen = document.getElementById(routeConfig.screenId);
      if (targetScreen) showScreen(targetScreen);
    }

    if (routeConfig.moduleNum && typeof switchGenesisModule === 'function') {
      // Directly activate target genesis module without triggering redirect loops
      document.querySelectorAll(".genesis-module-content").forEach(mod => mod.classList.remove("active"));
      document.querySelectorAll(".genesis-tab-btn").forEach(btn => btn.classList.remove("active"));

      const targetMod = document.getElementById(`gen-mod-${routeConfig.moduleNum}`);
      if (targetMod) targetMod.classList.add("active");

      const tabBtns = document.querySelectorAll(".genesis-tab-btn");
      if (tabBtns[routeConfig.moduleNum - 1]) tabBtns[routeConfig.moduleNum - 1].classList.add("active");

      if (routeConfig.moduleNum === 6) {
        if (typeof applyDesktopLayout === 'function') applyDesktopLayout(true);
        if (typeof renderMasterLedgerFeed === 'function') renderMasterLedgerFeed();
        if (routeConfig.roleView && typeof toggleDashboardRoleView === 'function') {
          toggleDashboardRoleView(routeConfig.roleView);
        }
      }
    }

    // Load sub-page HTML asynchronously if available
    this.loadSubpageHTML(routeConfig);

    // Reset window scroll position to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /**
   * Async Sub-Page HTML Loader
   * Fetches sub-page HTML template from frontend/pages/ and renders into DOM
   */
  async loadSubpageHTML(routeConfig) {
    if (!routeConfig || !routeConfig.subpage) return;
    try {
      const baseUrl = window.location.pathname.includes('/frontend/') ? '' : 'frontend/';
      const subpageUrl = baseUrl + routeConfig.subpage;
      const resp = await fetch(subpageUrl);
      if (resp.ok) {
        const html = await resp.text();
        const container = document.getElementById('page-content-container');
        if (container) {
          container.innerHTML = html;
          if (typeof logSystem === 'function') {
            logSystem(`SUB-PAGE RENDER: Dynamic HTML loaded from ${subpageUrl}`);
          }
        }
      }
    } catch (err) {
      // Fallback silently if running under strict local file:// protocol
      if (typeof logSystem === 'function') {
        logSystem(`SUB-PAGE LOADER: Using built-in DOM fallback for ${routeConfig.subpage}`);
      }
    }
  }
}

// Initialize Router globally
window.router = new CumpreAiRouter();
