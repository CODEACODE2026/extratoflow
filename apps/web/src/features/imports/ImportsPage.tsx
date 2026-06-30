import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, FileUp, RefreshCw, Trash2, Upload } from "lucide-react";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Toast } from "../../components/ui/Toast";
import {
  confirmImport,
  getImport,
  listImports,
  uploadPdfImport,
  type ImportCandidate,
  type ImportStatus,
  type StatementImport
} from "../../lib/api/imports";
import { ApiError } from "../../lib/api/client";
import type { TransactionType } from "../../lib/api/transactions";
import { formatCurrency } from "../../lib/formatters/currency";
import "./imports.css";

type ReviewRow = ImportCandidate & {
  id: string;
  discarded: boolean;
};

const confidenceTone = (confidence: ImportCandidate["confidence"]) => {
  if (confidence === "high") {
    return "transmitted";
  }

  if (confidence === "medium") {
    return "pending";
  }

  return "error";
};

const statusLabels: Record<ImportStatus, string> = {
  confirmed: "Confirmada",
  failed: "Falhou",
  processing: "Processando",
  review_required: "Revisao"
};

const statusTone = (status: ImportStatus) => {
  if (status === "confirmed") {
    return "transmitted" as const;
  }

  if (status === "failed") {
    return "error" as const;
  }

  return "pending" as const;
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));

const formatFileSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

const isValidAmount = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
};

export function ImportsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImport, setCurrentImport] = useState<StatementImport | null>(null);
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  const [ignoredLines, setIgnoredLines] = useState(0);
  const [recentImports, setRecentImports] = useState<StatementImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImport, setSelectedImport] = useState<StatementImport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const activeRows = reviewRows.filter((row) => !row.discarded);
  const discardedRows = reviewRows.length - activeRows.length;
  const invalidActiveRows = activeRows.filter((row) => !isValidAmount(row.amount));
  const activeMonths = Array.from(new Set(activeRows.map((row) => row.paymentDate.slice(0, 7))));
  const activeTotal = useMemo(() => activeRows.reduce((sum, row) => sum + Number(row.amount), 0), [activeRows]);

  const loadRecentImports = async () => {
    setLoading(true);

    try {
      setRecentImports(await listImports());
    } catch {
      setError("Nao foi possivel carregar o historico de importacoes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecentImports();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Selecione um PDF para importar.");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("O arquivo precisa ser um PDF.");
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadPdfImport(selectedFile);
      setCurrentImport(result.import);
      setIgnoredLines(result.ignoredLines);
      setReviewRows(
        result.candidates.map((candidate, index) => ({
          ...candidate,
          discarded: false,
          id: `${candidate.paymentDate}-${index}`
        }))
      );
      setSuccess("PDF processado para revisao.");
      await loadRecentImports();
    } catch {
      setError("Nao foi possivel processar o PDF. Verifique se o arquivo tem texto selecionavel.");
    } finally {
      setProcessing(false);
    }
  };

  const updateRow = (id: string, patch: Partial<ReviewRow>) => {
    setReviewRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const handleConfirm = async () => {
    if (!currentImport) {
      setError("Nenhuma importacao pronta para confirmar.");
      return;
    }

    if (activeRows.length === 0) {
      setError("Mantenha ao menos uma movimentacao para confirmar.");
      return;
    }

    if (invalidActiveRows.length > 0) {
      setError("Corrija ou descarte as movimentacoes com valor zerado antes de confirmar.");
      return;
    }

    if (activeMonths.length > 1) {
      setError(`Esta revisao tem meses misturados: ${activeMonths.join(", ")}. Descarte as linhas do mes errado antes de confirmar.`);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const result = await confirmImport(
        currentImport.id,
        activeRows.map((row) => ({
          amount: row.amount,
          descriptionText: row.descriptionText,
          payerName: row.payerName,
          paymentDate: row.paymentDate,
          rawText: row.rawText,
          type: row.type
        }))
      );

      setSuccess(`${result.savedTransactions} movimentacoes salvas como pendentes.`);
      setCurrentImport(result.import);
      setReviewRows([]);
      await loadRecentImports();
    } catch (confirmError) {
      setError(confirmError instanceof ApiError ? confirmError.message : "Nao foi possivel confirmar a importacao.");
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenDetail = async (statementImport: StatementImport) => {
    setSelectedImport(statementImport);
    setDetailLoading(true);
    setError(null);

    try {
      setSelectedImport(await getImport(statementImport.id));
    } catch {
      setError("Nao foi possivel carregar o detalhe da importacao.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <section className="import-upload">
        <div>
          <Badge tone="neutral">PDF textual</Badge>
          <h2>Importar extrato</h2>
          <p>Selecione um arquivo PDF para extrair movimentacoes e revisar antes de salvar.</p>
        </div>
        <div className="import-upload__controls">
          <label className="import-file" htmlFor="pdf-file">
            <FileUp aria-hidden="true" size={18} />
            <span>{selectedFile ? selectedFile.name : "Selecionar PDF"}</span>
            <input accept="application/pdf" id="pdf-file" onChange={handleFileChange} type="file" />
          </label>
          <Button leadingIcon={<Upload size={16} />} loading={processing} onClick={handleUpload}>
            Processar PDF
          </Button>
        </div>
      </section>

      {error ? (
        <section className="imports-error" role="alert">
          <Badge tone="error">Erro</Badge>
          <p>{error}</p>
        </section>
      ) : null}

      {reviewRows.length > 0 ? (
        <>
          <section className="review-summary" aria-label="Resumo da revisao">
            <article>
              <span>Detectadas</span>
              <strong>{reviewRows.length}</strong>
            </article>
            <article>
              <span>Mantidas</span>
              <strong>{activeRows.length}</strong>
            </article>
            <article>
              <span>Descartadas</span>
              <strong>{discardedRows}</strong>
            </article>
            <article>
              <span>Ignoradas</span>
              <strong>{ignoredLines}</strong>
            </article>
            <article>
              <span>Total mantido</span>
              <strong>{formatCurrency(activeTotal)}</strong>
            </article>
            <article>
              <span>Mes da revisao</span>
              <strong>{activeMonths.length === 1 ? activeMonths[0] : "Misturado"}</strong>
            </article>
            {invalidActiveRows.length > 0 ? (
              <article>
                <span>Com valor 0</span>
                <strong>{invalidActiveRows.length}</strong>
              </article>
            ) : null}
            {activeMonths.length > 1 ? (
              <article>
                <span>Meses detectados</span>
                <strong>{activeMonths.length}</strong>
              </article>
            ) : null}
          </section>

          <section className="panel">
            <header className="panel__header">
              <div>
                <h2>Revisao da importacao</h2>
                <p>Corrija campos, descarte linhas invalidas e confirme para salvar como pendente.</p>
              </div>
              <Button leadingIcon={<CheckCircle2 size={16} />} loading={processing} onClick={handleConfirm}>
                Confirmar importacao
              </Button>
            </header>

            <div className="import-review-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Pagador</th>
                    <th>Descricao</th>
                    <th className="is-right">Valor</th>
                    <th>Confianca</th>
                    <th className="is-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {reviewRows.map((row) => (
                    <tr className={row.discarded ? "is-discarded" : undefined} key={row.id}>
                      <td>
                        <Input label="Data" onChange={(event) => updateRow(row.id, { paymentDate: event.target.value })} type="date" value={row.paymentDate} />
                      </td>
                      <td>
                        <label className="field" htmlFor={`type-${row.id}`}>
                          <span className="field__label">Tipo</span>
                          <select className="field__control" id={`type-${row.id}`} onChange={(event) => updateRow(row.id, { type: event.target.value as TransactionType })} value={row.type}>
                            <option value="entry">Entrada</option>
                            <option value="exit">Saida</option>
                          </select>
                        </label>
                      </td>
                      <td>
                        <Input label="Pagador" onChange={(event) => updateRow(row.id, { payerName: event.target.value })} value={row.payerName ?? ""} />
                      </td>
                      <td>
                        <Input label="Descricao" onChange={(event) => updateRow(row.id, { descriptionText: event.target.value })} value={row.descriptionText ?? ""} />
                      </td>
                      <td>
                        <Input label="Valor" min="0.01" onChange={(event) => updateRow(row.id, { amount: event.target.value })} step="0.01" type="number" value={row.amount} />
                      </td>
                      <td>
                        <Badge tone={confidenceTone(row.confidence)}>{row.confidence}</Badge>
                      </td>
                      <td className="is-right">
                        <Button
                          aria-label={row.discarded ? "Restaurar linha" : "Descartar linha"}
                          leadingIcon={<Trash2 size={16} />}
                          onClick={() => updateRow(row.id, { discarded: !row.discarded })}
                          size="icon"
                          variant="ghost"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      <section className="panel">
        <header className="panel__header">
          <div>
            <h2>Historico de importacoes</h2>
            <p>Ultimos PDFs enviados para processamento.</p>
          </div>
          <Button leadingIcon={<RefreshCw size={16} />} onClick={loadRecentImports} variant="secondary">
            Atualizar
          </Button>
        </header>

        {loading ? (
          <div className="imports-loading">
            <span className="skeleton-line skeleton-line--title" />
            <span className="skeleton-line" />
            <span className="skeleton-line" />
          </div>
        ) : recentImports.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum PDF importado</strong>
            <p>Selecione um arquivo PDF para iniciar a revisao.</p>
          </div>
        ) : (
          <div className="imports-history">
            {recentImports.map((statementImport) => (
              <article key={statementImport.id}>
                <div className="imports-history__main">
                  <strong>{statementImport.fileOriginalName}</strong>
                  <span>{`${formatDateTime(statementImport.createdAt)} · Usuario ${statementImport.userId}`}</span>
                  {statementImport.errorMessage ? <small>{statementImport.errorMessage}</small> : null}
                </div>
                <div className="imports-history__stats">
                  <span>
                    <strong>{statementImport.totalLinesRead}</strong>
                    linhas
                  </span>
                  <span>
                    <strong>{statementImport.totalTransactionsDetected}</strong>
                    detectadas
                  </span>
                  <span>
                    <strong>{statementImport.totalTransactionsSaved}</strong>
                    salvas
                  </span>
                </div>
                <div className="imports-history__actions">
                  <Badge tone={statusTone(statementImport.status)}>{statusLabels[statementImport.status]}</Badge>
                  <Button
                    aria-label="Ver detalhe da importacao"
                    leadingIcon={<Eye size={16} />}
                    onClick={() => handleOpenDetail(statementImport)}
                    size="icon"
                    variant="ghost"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        description="Resumo tecnico do processamento do PDF selecionado."
        footer={
          <Button onClick={() => setSelectedImport(null)} variant="secondary">
            Fechar
          </Button>
        }
        onClose={() => setSelectedImport(null)}
        open={Boolean(selectedImport)}
        title="Detalhe da importacao"
      >
        {selectedImport ? (
          <div className="import-detail">
            {detailLoading ? (
              <div className="imports-loading">
                <span className="skeleton-line skeleton-line--title" />
                <span className="skeleton-line" />
              </div>
            ) : (
              <>
                <div className="import-detail__header">
                  <div>
                    <strong>{selectedImport.fileOriginalName}</strong>
                    <span>{selectedImport.id}</span>
                  </div>
                  <Badge tone={statusTone(selectedImport.status)}>{statusLabels[selectedImport.status]}</Badge>
                </div>

                <dl className="import-detail__grid">
                  <div>
                    <dt>Usuario</dt>
                    <dd>{selectedImport.userId}</dd>
                  </div>
                  <div>
                    <dt>Tamanho</dt>
                    <dd>{formatFileSize(selectedImport.fileSize)}</dd>
                  </div>
                  <div>
                    <dt>Tipo</dt>
                    <dd>{selectedImport.fileMimeType}</dd>
                  </div>
                  <div>
                    <dt>Criado em</dt>
                    <dd>{formatDateTime(selectedImport.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Atualizado em</dt>
                    <dd>{formatDateTime(selectedImport.updatedAt)}</dd>
                  </div>
                  <div>
                    <dt>Linhas lidas</dt>
                    <dd>{selectedImport.totalLinesRead}</dd>
                  </div>
                  <div>
                    <dt>Detectadas</dt>
                    <dd>{selectedImport.totalTransactionsDetected}</dd>
                  </div>
                  <div>
                    <dt>Salvas</dt>
                    <dd>{selectedImport.totalTransactionsSaved}</dd>
                  </div>
                </dl>

                {selectedImport.errorMessage ? (
                  <div className="import-detail__error" role="alert">
                    <Badge tone="error">Erro</Badge>
                    <p>{selectedImport.errorMessage}</p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </Modal>

      {success ? (
        <div className="toast-region" aria-live="polite">
          <Toast tone="success" title={success} />
        </div>
      ) : null}
    </>
  );
}
