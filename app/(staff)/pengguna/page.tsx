import {DataTable} from "@/components/table/data-table";
import prisma from "@/lib/prisma";
import {penggunaColumns} from "./table/PenggunaColumns";
import TablePagination from "@/components/table/table-pagination";
import SearchInput from "@/components/SearchInput";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {IconFilePlus} from "@tabler/icons-react";

type SearchParams = Promise<{page?: string; perPage?: string; q?: string}>;

const UsersPage = async (props: {searchParams: SearchParams}) => {
  const prismadb = prisma;
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const perPage = Number(searchParams.perPage) || 10;
  const query = searchParams.q ?? "";

  const [count, users] = await prismadb.$transaction([
    prismadb.user.count({
      where: {
        nama_lengkap: {contains: query, mode: "insensitive"},
      },
    }),
    prismadb.user.findMany({
      include: {
        posyandu: true,
      },
      skip: (page - 1) * perPage,
      take: perPage,
      where: {
        nama_lengkap: {contains: query, mode: "insensitive"},
      },
    }),
  ]);

  const TablePaginationProps = {
    page,
    perPage,
    query,
    count,
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 md:px-6">
          <div className="flex gap-6">
            <SearchInput placeholder="Cari Berdasarkan Nama..." />
            <Link href={"/#"}>
              <Button>
                <IconFilePlus /> <span>Baru</span>
              </Button>
            </Link>
          </div>
          <DataTable columns={penggunaColumns} data={users} />
          <TablePagination {...TablePaginationProps} />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
