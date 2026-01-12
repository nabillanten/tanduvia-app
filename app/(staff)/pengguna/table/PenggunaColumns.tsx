"use client";
import z from "zod";
import {type ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge";
import {format} from "date-fns";
import {IconCircleCheckFilled, IconCircleXFilled, IconDotsVertical} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const PosyanduSchema = z.object({
  id: z.string(),
  created_at: z.date(),
  nama_posyandu: z.string(),
  alamat: z.string().nullable(),
});

const RoleEnum = z.enum(["super_admin", "petugas", "ahli_gizi", "ibu"]);
export const schema = z.object({
  id: z.string(),
  nama_lengkap: z.string(),
  no_telepon: z.string().nullable(),
  role: RoleEnum,
  created_at: z.date(),
  username: z.string(),
  is_active: z.boolean(),
  posyandu: PosyanduSchema.nullable(),
});

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  petugas: "Petugas",
  ahli_gizi: "Ahli Gizi",
  ibu: "Ibu",
};

export const penggunaColumns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "nama_lengkap",
    header: "Nama",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({row}) => {
      const role = row.original.role;
      return <p>{roleLabels[role] || role}</p>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Tanggal Dibuat",
    cell: ({row}) => {
      const date = format(row.getValue("created_at"), "MMM d, yyyy");
      return date;
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({row}) => (
      <Badge variant="outline" className="text-muted-foreground">
        {row.original.is_active === true ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconCircleXFilled className="fill-red-500 dark:fill-red-400" />
        )}
        {row.original.is_active ? "Aktif" : "Non-Aktif"}
      </Badge>
    ),
  },
  {
    accessorKey: "posyandu.nama_posyandu",
    header: "Posyandu",
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon">
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Ubah</DropdownMenuItem>
          <DropdownMenuItem>Non-Aktifkan</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Hapus</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
