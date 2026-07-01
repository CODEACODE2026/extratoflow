import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./Button";

type PaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
};

const perPageOptions = [10, 25, 50, 100];

export function Pagination({ onPageChange, onPerPageChange, page, perPage, total }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  const firstItem = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const lastItem = Math.min(currentPage * perPage, total);

  return (
    <div className="pagination" aria-label="Paginacao de registros">
      <span className="pagination__summary">
        {total === 0 ? "0 registros" : `${firstItem}-${lastItem} de ${total} registros`}
      </span>

      <div className="pagination__controls">
        {onPerPageChange ? (
          <label className="pagination__per-page" htmlFor="pagination-per-page">
            <span>Por pagina</span>
            <select
              id="pagination-per-page"
              onChange={(event) => onPerPageChange(Number(event.target.value))}
              value={perPage}
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <Button
          aria-label="Pagina anterior"
          disabled={currentPage <= 1}
          leadingIcon={<ChevronLeft size={16} />}
          onClick={() => onPageChange(currentPage - 1)}
          size="icon"
          variant="secondary"
        />
        <strong>{`${currentPage}/${totalPages}`}</strong>
        <Button
          aria-label="Proxima pagina"
          disabled={currentPage >= totalPages}
          leadingIcon={<ChevronRight size={16} />}
          onClick={() => onPageChange(currentPage + 1)}
          size="icon"
          variant="secondary"
        />
      </div>
    </div>
  );
}
