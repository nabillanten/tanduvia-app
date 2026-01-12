import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  page: number;
  perPage: number;
  query: string;
  count: number;
};

const TablePagination = (props: Props) => {
  const {page, query, perPage, count} = props;
  return (
    <section className="flex items-center justify-end gap-6">
      <p className="text-sm">
        Page {page} of {Math.ceil(Number(count) / perPage) || 1}
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={Number(page) < 2}
              route={`?page=${Number(page) - 1}&perPage=${perPage}&q=${query}`}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              disabled={Number(count) / Number(perPage) <= Number(page)}
              route={`?page=${Number(page) + 1}&perPage=${perPage}&q=${query}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </section>
  );
};

export default TablePagination;
