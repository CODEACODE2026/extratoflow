import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, RefreshCw, Search, ToggleLeft, ToggleRight } from "lucide-react";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { Toast } from "../../components/ui/Toast";
import {
  createDescription,
  listDescriptions,
  updateDescription,
  updateDescriptionStatus,
  type Description,
  type DescriptionStatus,
  type SuggestedTransactionType
} from "../../lib/api/descriptions";
import "./descriptions.css";

type FormState = {
  id?: string;
  name: string;
  suggestedType: SuggestedTransactionType | "";
};

const initialFormState: FormState = {
  name: "",
  suggestedType: ""
};

const typeLabel = (type: Description["suggestedType"]) => {
  if (type === "entry") {
    return "Entrada";
  }

  if (type === "exit") {
    return "Saida";
  }

  if (type === "refund") {
    return "Devolucao";
  }

  return "Sem sugestao";
};

const typeTone = (type: Description["suggestedType"]) => {
  if (type === "entry" || type === "exit" || type === "refund") {
    return type;
  }

  return "neutral";
};

export function DescriptionsPage() {
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [statusFilter, setStatusFilter] = useState<DescriptionStatus | "all">("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const loadDescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setDescriptions(await listDescriptions(statusFilter));
    } catch {
      setError("Nao foi possivel carregar as descricoes. Verifique a sessao, a API e o banco de dados.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadDescriptions();
  }, [loadDescriptions]);

  const filteredDescriptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return descriptions;
    }

    return descriptions.filter((description) => description.name.toLowerCase().includes(normalizedSearch));
  }, [descriptions, searchTerm]);
  const paginatedDescriptions = useMemo(() => {
    const start = (page - 1) * perPage;

    return filteredDescriptions.slice(start, start + perPage);
  }, [filteredDescriptions, page, perPage]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const openCreateModal = () => {
    setForm(initialFormState);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (description: Description) => {
    setForm({
      id: description.id,
      name: description.name,
      suggestedType: description.suggestedType ?? ""
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

    if (!name) {
      setFormError("Informe o nome da descricao.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (form.id) {
        await updateDescription(form.id, {
          name,
          suggestedType: form.suggestedType || null
        });
        setSuccess("Descricao atualizada.");
      } else {
        await createDescription({
          name,
          suggestedType: form.suggestedType || undefined
        });
        setSuccess("Descricao criada.");
      }

      setModalOpen(false);
      await loadDescriptions();
    } catch {
      setFormError("Nao foi possivel salvar a descricao.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (description: Description) => {
    const nextStatus: DescriptionStatus = description.status === "active" ? "inactive" : "active";

    setSaving(true);
    setError(null);

    try {
      await updateDescriptionStatus(description.id, nextStatus);
      setSuccess(nextStatus === "active" ? "Descricao ativada." : "Descricao inativada.");
      await loadDescriptions();
    } catch {
      setError("Nao foi possivel alterar o status da descricao.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Descricao",
      render: (row: Description) => row.name
    },
    {
      key: "type",
      header: "Tipo sugerido",
      render: (row: Description) => (
        <Badge tone={typeTone(row.suggestedType)}>
          {typeLabel(row.suggestedType)}
        </Badge>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row: Description) => (
        <Badge tone={row.status === "active" ? "transmitted" : "neutral"}>
          {row.status === "active" ? "Ativa" : "Inativa"}
        </Badge>
      )
    },
    {
      align: "right" as const,
      key: "actions",
      header: "",
      render: (row: Description) => (
        <div className="description-actions">
          <Button
            aria-label="Editar descricao"
            leadingIcon={<Edit3 size={16} />}
            onClick={() => openEditModal(row)}
            size="icon"
            variant="ghost"
          />
          <Button
            aria-label={row.status === "active" ? "Inativar descricao" : "Ativar descricao"}
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
      <section className="descriptions-toolbar" aria-label="Filtros de descricoes">
        <div className="description-search">
          <Search aria-hidden="true" size={16} />
          <input
            aria-label="Buscar descricao"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar descricao"
            type="search"
            value={searchTerm}
          />
        </div>

        <label className="field descriptions-status" htmlFor="description-status-filter">
          <span className="field__label">Status</span>
          <select
            className="field__control"
            id="description-status-filter"
            onChange={(event) => setStatusFilter(event.target.value as DescriptionStatus | "all")}
            value={statusFilter}
          >
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
            <option value="all">Todas</option>
          </select>
        </label>

        <Button leadingIcon={<RefreshCw size={16} />} onClick={loadDescriptions} variant="secondary">
          Atualizar
        </Button>
        <Button leadingIcon={<Plus size={16} />} onClick={openCreateModal}>
          Nova descricao
        </Button>
      </section>

      {error ? (
        <section className="descriptions-error" role="alert">
          <Badge tone="error">Erro</Badge>
          <h2>Descricoes indisponiveis</h2>
          <p>{error}</p>
        </section>
      ) : null}

      <section className="panel">
        <header className="panel__header">
          <div>
            <h2>Descricoes padrao</h2>
            <p>Cadastros usados para classificar movimentacoes financeiras.</p>
          </div>
          <Badge tone="neutral">{`${filteredDescriptions.length} registros`}</Badge>
        </header>

        {loading ? (
          <div className="descriptions-loading" aria-label="Carregando descricoes">
            <span className="skeleton-line skeleton-line--title" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            emptyDescription="Crie a primeira descricao padrao para acelerar a revisao das movimentacoes."
            emptyTitle="Nenhuma descricao encontrada"
            getRowKey={(row) => row.id}
            rows={paginatedDescriptions}
          />
        )}
        {!loading ? (
          <Pagination
            onPageChange={setPage}
            onPerPageChange={(nextPerPage) => {
              setPerPage(nextPerPage);
              setPage(1);
            }}
            page={page}
            perPage={perPage}
            total={filteredDescriptions.length}
          />
        ) : null}
      </section>

      <Modal
        description={form.id ? "Edite os dados da descricao padrao." : "Cadastre uma descricao para uso nas movimentacoes."}
        footer={
          <>
            <Button disabled={saving} onClick={closeModal} variant="secondary">
              Cancelar
            </Button>
            <Button form="description-form" loading={saving} type="submit">
              Salvar
            </Button>
          </>
        }
        onClose={closeModal}
        open={modalOpen}
        title={form.id ? "Editar descricao" : "Nova descricao"}
      >
        <form className="description-form" id="description-form" onSubmit={handleSubmit}>
          {formError ? (
            <div className="login-alert login-alert--error" role="alert">
              {formError}
            </div>
          ) : null}
          <Input
            error={formError && !form.name.trim() ? formError : undefined}
            label="Nome"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ex: PIX credito"
            value={form.name}
          />

          <label className="field" htmlFor="description-suggested-type">
            <span className="field__label">Tipo sugerido</span>
            <select
              className="field__control"
              id="description-suggested-type"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  suggestedType: event.target.value as SuggestedTransactionType | ""
                }))
              }
              value={form.suggestedType}
            >
              <option value="">Sem sugestao</option>
              <option value="entry">Entrada</option>
              <option value="exit">Saida</option>
              <option value="refund">Devolucao</option>
            </select>
          </label>
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
