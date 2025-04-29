"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Pencil, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PenawaranDetail {
  nama_produk: string;
}

interface Kontrak {
  id: number;
  penawaran_detail: PenawaranDetail | null;
  supplier_company_name?: string;
  start_date: string;
  end_date: string;
  status: string;
}

const statusOptions = [
  { value: "Aktif", label: "Aktif" },
  { value: "Nonaktif", label: "Nonaktif" },
];

export default function KontrakTable() {
  const { getToken } = useAuth();
  const token = getToken();
  const router = useRouter();
  const [kontrak, setKontrak] = useState<Kontrak[]>([]);
  const [filteredKontrak, setFilteredKontrak] = useState<Kontrak[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const fetchKontrak = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_kontrak/kontrak/daftar_kontrak/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Gagal mengambil data kontrak.");

        const data = await response.json();
        console.log("✅ Data kontrak dari API:", data);
        setKontrak(data);
        setFilteredKontrak(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchKontrak();
  }, [token]);

  useEffect(() => {
    const filtered = kontrak.filter((item) => {
      const matchSearch = item.penawaran_detail?.nama_produk
        ?.toLowerCase()
        .includes(search.toLowerCase()) ?? false;

      const matchDate = date?.from && date?.to
        ? new Date(item.end_date) >= date.from && new Date(item.end_date) <= date.to
        : true;

      const matchStatus = !selectedStatus || selectedStatus === "all" || item.status === selectedStatus;

      return matchSearch && matchDate && matchStatus;
    });
    setFilteredKontrak(filtered);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, date, selectedStatus, kontrak]);

  const columns: ColumnDef<Kontrak>[] = [
    {
      accessorKey: "id",
      header: "Kode Kontrak",
      cell: ({ row }) => (
        <a href={`/kontrak/${row.original.id}`} className="hover:underline">
          {`KONTRAK-${row.original.id}`}
        </a>
      ),
    },
    {
      accessorKey: "penawaran.nama_produk",
      header: "Nama Produk",
      cell: ({ row }) => row.original.penawaran_detail?.nama_produk || "-",
    },
    {
      accessorKey: "supplier_company_name",
      header: "Nama Supplier",
      cell: ({ row }) => row.original.supplier_company_name || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "end_date",
      header: "Tanggal Berakhir",
      cell: (info) => format(new Date(info.getValue() as string), "dd/MM/yyyy"),
    },
  ];

  const table = useReactTable({
    data: filteredKontrak,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = pagination;
  const totalItems = filteredKontrak.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <Input
          type="text"
          placeholder="Cari nama produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2"
        />
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length}>Loading...</TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>Tidak ada kontrak ditemukan.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan {startItem}–{endItem} dari {totalItems} entri
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Halaman {pageIndex + 1} dari {totalPages || 1}</span>
          <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.setPageIndex(totalPages - 1)} disabled={!table.getCanNextPage()}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
