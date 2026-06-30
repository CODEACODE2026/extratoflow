import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Menu,
  LogOut,
  ReceiptText,
  Search,
  Settings,
  Upload,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../components/ui/Button";
import { LoginPage } from "../features/auth/LoginPage";
import { DashboardPreview } from "../features/dashboard/DashboardPreview";
import { DescriptionsPage } from "../features/descriptions/DescriptionsPage";
import { ImportsPage } from "../features/imports/ImportsPage";
import { InvoicesPage } from "../features/invoices/InvoicesPage";
import { TransactionsPage } from "../features/transactions/TransactionsPage";
import { UsersPage } from "../features/users/UsersPage";
import { getCurrentUser, login, logout, type AuthenticatedUser } from "../lib/api/auth";
import { ApiError } from "../lib/api/client";

type AppView = "dashboard" | "import" | "transactions" | "descriptions" | "users" | "invoices";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
  { label: "Importar", icon: Upload, view: "import" },
  { label: "Movimentacoes", icon: ReceiptText, view: "transactions" },
  { label: "Descricoes", icon: FileText, view: "descriptions" },
  { label: "Usuarios", icon: Users, view: "users" },
  { label: "Lancamento mensal", icon: BookOpen, view: "invoices" }
] satisfies { label: string; icon: typeof LayoutDashboard; view: AppView }[];

const viewTitles: Record<AppView, { eyebrow: string; title: string }> = {
  dashboard: { eyebrow: "Periodo atual: abril de 2026", title: "Dashboard financeiro" },
  descriptions: { eyebrow: "Cadastros", title: "Descricoes padrao" },
  import: { eyebrow: "Importacao", title: "Importar extrato" },
  invoices: { eyebrow: "Fechamento", title: "Lancamento mensal" },
  transactions: { eyebrow: "Operacao", title: "Movimentacoes" },
  users: { eyebrow: "Administracao", title: "Usuarios" }
};

const enabledViews: AppView[] = ["dashboard", "import", "transactions", "descriptions", "users", "invoices"];

const renderView = (view: AppView) => {
  if (view === "users") {
    return <UsersPage />;
  }

  if (view === "invoices") {
    return <InvoicesPage />;
  }

  if (view === "import") {
    return <ImportsPage />;
  }

  if (view === "transactions") {
    return <TransactionsPage />;
  }

  if (view === "descriptions") {
    return <DescriptionsPage />;
  }

  return <DashboardPreview />;
};

const getNextView = (view: AppView) => {
  if (enabledViews.includes(view)) {
    return view;
  }

  return "dashboard";
};

const getCurrentTitle = (view: AppView) => {
  return viewTitles[view] ?? viewTitles.dashboard;
};

const getViewFromHash = () => {
  const hashView = window.location.hash.replace("#", "") as AppView;

  return getNextView(hashView);
};

export function App() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | undefined>();
  const [currentView, setCurrentView] = useState<AppView>(getViewFromHash);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((user) => {
        if (active) {
          setCurrentUser(user);
        }
      })
      .catch((error) => {
        if (active && error instanceof ApiError && error.code === "INVALID_SESSION") {
          setSessionMessage("Sua sessao expirou. Entre novamente para continuar.");
        }
      })
      .finally(() => {
        if (active) {
          setCheckingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => setCurrentView(getViewFromHash());

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const user = await login(email, password);
    setCurrentUser(user);
    setSessionMessage(undefined);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
  };

  const handleChangeView = (view: AppView) => {
    const nextView = getNextView(view);
    window.location.hash = nextView;
    setCurrentView(nextView);
  };

  if (checkingSession) {
    return (
      <main className="auth-loading">
        <section className="auth-loading__box" aria-live="polite">
          <div className="auth-loading__bar" />
          <strong>Verificando sessao</strong>
          <p>Aguarde um instante.</p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} sessionMessage={sessionMessage} />;
  }

  const currentTitle = getCurrentTitle(currentView);

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Navegacao principal">
        <div className="brand">
          <span className="brand-mark">EF</span>
          <div>
            <strong>ExtratoFlow</strong>
            <span>Controle financeiro</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              aria-current={currentView === item.view ? "page" : undefined}
              className="nav-item"
              key={item.label}
              onClick={() => handleChangeView(item.view)}
              type="button"
            >
              <item.icon aria-hidden="true" size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" type="button">
            <Settings aria-hidden="true" size={18} />
            <span>Configuracoes</span>
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <Button aria-label="Abrir menu" className="mobile-menu" leadingIcon={<Menu size={17} />} size="icon" variant="ghost" />

          <div className="page-title">
            <span className="eyebrow">{currentTitle.eyebrow}</span>
            <h1>{currentTitle.title}</h1>
          </div>

          <div className="topbar__actions">
            <div className="search-box" role="search">
              <Search aria-hidden="true" size={16} />
              <input aria-label="Buscar no sistema" placeholder="Buscar" type="search" />
            </div>
            <div className="user-chip" title={currentUser.email}>
              <span>{currentUser.name.charAt(0).toUpperCase()}</span>
              <div>
                <strong>{currentUser.name}</strong>
                <small>{currentUser.role}</small>
              </div>
            </div>
            <Button leadingIcon={<Upload size={16} />} onClick={() => handleChangeView("import")}>Importar PDF</Button>
            <Button aria-label="Sair" leadingIcon={<LogOut size={16} />} onClick={handleLogout} size="icon" variant="secondary" />
          </div>
        </header>

        {renderView(currentView)}
      </section>
    </main>
  );
}
