import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, RefreshCw, Search, ToggleLeft, ToggleRight } from "lucide-react";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { MetricCard } from "../../components/ui/MetricCard";
import { Modal } from "../../components/ui/Modal";
import { Toast } from "../../components/ui/Toast";
import { createUser, listUsers, updateUser, updateUserStatus, type User, type UserRole, type UserStatus } from "../../lib/api/users";
import "./users.css";

type FormState = {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const initialFormState: FormState = {
  email: "",
  name: "",
  password: "",
  role: "operator"
};

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  operator: "Operador",
  viewer: "Visualizador"
};

const roleTone = (role: UserRole) => {
  if (role === "admin") {
    return "entry" as const;
  }

  if (role === "operator") {
    return "pending" as const;
  }

  return "neutral" as const;
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("active");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setUsers(await listUsers());
    } catch {
      setError("Nao foi possivel carregar os usuarios. Verifique a sessao, a permissao de admin, a API e o banco de dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesRole && matchesSearch;
    });
  }, [roleFilter, searchTerm, statusFilter, users]);

  const metrics = useMemo(() => {
    return {
      active: users.filter((user) => user.status === "active").length,
      admins: users.filter((user) => user.role === "admin" && user.status === "active").length,
      inactive: users.filter((user) => user.status === "inactive").length,
      total: users.length
    };
  }, [users]);

  const openCreateModal = () => {
    setForm(initialFormState);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setForm({
      email: user.email,
      id: user.id,
      name: user.name,
      password: "",
      role: user.role
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) {
      setModalOpen(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (!name || !email) {
      setFormError("Informe nome e e-mail.");
      return;
    }

    if (!form.id && password.length < 8) {
      setFormError("A senha inicial deve ter pelo menos 8 caracteres.");
      return;
    }

    if (form.id && password && password.length < 8) {
      setFormError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (form.id) {
        await updateUser(form.id, {
          email,
          name,
          password: password || undefined,
          role: form.role
        });
        setSuccess("Usuario atualizado.");
      } else {
        await createUser({
          email,
          name,
          password,
          role: form.role
        });
        setSuccess("Usuario criado.");
      }

      setModalOpen(false);
      await loadUsers();
    } catch {
      setFormError("Nao foi possivel salvar o usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus: UserStatus = user.status === "active" ? "inactive" : "active";

    setSaving(true);
    setError(null);

    try {
      await updateUserStatus(user.id, nextStatus);
      setSuccess(nextStatus === "active" ? "Usuario ativado." : "Usuario inativado.");
      await loadUsers();
    } catch {
      setError("Nao foi possivel alterar o status do usuario.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Usuario",
      render: (row: User) => (
        <div className="user-cell">
          <span>{row.name.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{row.name}</strong>
            <small>{row.email}</small>
          </div>
        </div>
      )
    },
    {
      key: "role",
      header: "Perfil",
      render: (row: User) => <Badge tone={roleTone(row.role)}>{roleLabels[row.role]}</Badge>
    },
    {
      key: "status",
      header: "Status",
      render: (row: User) => (
        <Badge tone={row.status === "active" ? "transmitted" : "neutral"}>
          {row.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
    {
      align: "right" as const,
      key: "actions",
      header: "",
      render: (row: User) => (
        <div className="users-actions">
          <Button
            aria-label="Editar usuario"
            leadingIcon={<Edit3 size={16} />}
            onClick={() => openEditModal(row)}
            size="icon"
            variant="ghost"
          />
          <Button
            aria-label={row.status === "active" ? "Inativar usuario" : "Ativar usuario"}
            leadingIcon={row.status === "active" ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
            onClick={() => handleToggleStatus(row)}
            size="icon"
            variant="ghost"
          />
        </div>
      )
    }
  ];

  return (
    <>
      <section className="users-metrics" aria-label="Resumo de usuarios">
        <MetricCard label="Usuarios" period="Total cadastrado" value={metrics.total.toString()} />
        <MetricCard label="Ativos" period="Com acesso liberado" tone="transmitted" value={metrics.active.toString()} />
        <MetricCard label="Admins ativos" period="Perfil administrativo" value={metrics.admins.toString()} />
        <MetricCard label="Inativos" period="Acesso bloqueado" tone="pending" value={metrics.inactive.toString()} />
      </section>

      <section className="users-toolbar" aria-label="Filtros de usuarios">
        <div className="users-search">
          <Search aria-hidden="true" size={16} />
          <input
            aria-label="Buscar usuario"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome ou e-mail"
            type="search"
            value={searchTerm}
          />
        </div>

        <label className="field users-filter" htmlFor="users-role-filter">
          <span className="field__label">Perfil</span>
          <select
            className="field__control"
            id="users-role-filter"
            onChange={(event) => setRoleFilter(event.target.value as UserRole | "all")}
            value={roleFilter}
          >
            <option value="all">Todos</option>
            <option value="admin">Admin</option>
            <option value="operator">Operador</option>
            <option value="viewer">Visualizador</option>
          </select>
        </label>

        <label className="field users-filter" htmlFor="users-status-filter">
          <span className="field__label">Status</span>
          <select
            className="field__control"
            id="users-status-filter"
            onChange={(event) => setStatusFilter(event.target.value as UserStatus | "all")}
            value={statusFilter}
          >
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="all">Todos</option>
          </select>
        </label>

        <Button leadingIcon={<RefreshCw size={16} />} onClick={loadUsers} variant="secondary">
          Atualizar
        </Button>
        <Button leadingIcon={<Plus size={16} />} onClick={openCreateModal}>
          Novo usuario
        </Button>
      </section>

      {error ? (
        <section className="users-error" role="alert">
          <Badge tone="error">Erro</Badge>
          <h2>Usuarios indisponiveis</h2>
          <p>{error}</p>
        </section>
      ) : null}

      <section className="panel">
        <header className="panel__header">
          <div>
            <h2>Equipe e permissoes</h2>
            <p>Controle de acesso para administracao, operacao e consulta.</p>
          </div>
          <Badge tone="neutral">{`${filteredUsers.length} registros`}</Badge>
        </header>

        {loading ? (
          <div className="users-loading" aria-label="Carregando usuarios">
            <span className="skeleton-line skeleton-line--title" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            emptyDescription="Crie usuarios para liberar acesso ao ExtratoFlow com o perfil correto."
            emptyTitle="Nenhum usuario encontrado"
            getRowKey={(row) => row.id}
            rows={filteredUsers}
          />
        )}
      </section>

      <Modal
        description={form.id ? "Edite dados cadastrais, perfil e senha opcional." : "Cadastre um acesso com perfil definido."}
        footer={
          <>
            <Button disabled={saving} onClick={closeModal} variant="secondary">
              Cancelar
            </Button>
            <Button form="user-form" loading={saving} type="submit">
              Salvar
            </Button>
          </>
        }
        onClose={closeModal}
        open={modalOpen}
        title={form.id ? "Editar usuario" : "Novo usuario"}
      >
        <form className="user-form" id="user-form" onSubmit={handleSubmit}>
          {formError ? (
            <div className="login-alert login-alert--error" role="alert">
              {formError}
            </div>
          ) : null}

          <Input
            error={formError && !form.name.trim() ? formError : undefined}
            label="Nome"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ex: Ana Oliveira"
            value={form.name}
          />

          <Input
            error={formError && !form.email.trim() ? formError : undefined}
            label="E-mail"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="ana@empresa.com"
            type="email"
            value={form.email}
          />

          <label className="field" htmlFor="user-role">
            <span className="field__label">Perfil</span>
            <select
              className="field__control"
              id="user-role"
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
              value={form.role}
            >
              <option value="admin">Admin</option>
              <option value="operator">Operador</option>
              <option value="viewer">Visualizador</option>
            </select>
          </label>

          <Input
            hint={form.id ? "Preencha somente se quiser alterar a senha." : "Minimo de 8 caracteres."}
            label={form.id ? "Nova senha" : "Senha inicial"}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="********"
            type="password"
            value={form.password}
          />
        </form>
      </Modal>

      {success ? (
        <div className="toast-region" aria-live="polite">
          <Toast tone="success" title={success} />
        </div>
      ) : null}
    </>
  );
}
