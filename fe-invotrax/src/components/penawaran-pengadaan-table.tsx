"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PenawaranPengadaan {
  id: number;
  nama_produk: string;
  status: string;
  created_at: string;
}

const statusOptions = [
  { value: "diajukan", label: "Diajukan" },
  { value: "diproses", label: "Diproses" },
  { value: "ditolak", label: "Ditolak" },
  { value: "dikirim", label: "Dikirim" },
  { value: "diterima", label: "Diterima" },
];

export default function PenawaranTable() {
  const { getToken } = useAuth();
  const token = getToken();
  const router = useRouter();
  const [penawaran, setPenawaran] = useState<PenawaranPengadaan[]>([]);
  const [filteredPenawaran, setFilteredPenawaran] = useState<PenawaranPengadaan[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // NEW
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const fetchPenawaran = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/penawaran/penawaran-pengadaan/daftar_penawaran_pengadaan/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Gagal mengambil data penawaran.");

        const data = await response.json();
        setPenawaran(data);
        setFilteredPenawaran(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPenawaran();
  }, [token]);

  useEffect(() => {
    const filtered = penawaran.filter((item) => {
      const matchSearch = item.nama_produk.toLowerCase().includes(search.toLowerCase());
      const matchDate = date?.from && date?.to
        ? new Date(item.created_at) >= date.from && new Date(item.created_at) <= date.to
        : true;

      const matchStatus = !selectedStatus || selectedStatus === "all" || item.status === selectedStatus;

      return matchSearch && matchDate && matchStatus;
    });
    setFilteredPenawaran(filtered);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search, date, selectedStatus, penawaran]);

  const columns: ColumnDef<PenawaranPengadaan>[] = [
    {
      accessorKey: "id",
      header: "Kode",
      cell: (info) => `PROD-${info.getValue()}`,
    },
    {
      accessorKey: "nama_produk",
      header: "Nama Produk",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "created_at",
      header: "Tanggal Diajukan",
      cell: (info) => format(new Date(info.getValue() as string), "yyyy-MM-dd"),
    },
    {
      id: "edit",
      header: "Edit",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          onClick={() => router.push(`/penawaran-pengadaan/${row.original.id}/update`)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredPenawaran,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = pagination;
  const totalItems = filteredPenawaran.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <Input
          type="text"
          placeholder="Cari penawaran pengadaan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2"
        />
        <DatePickerWithRange date={date} setDate={setDate} />
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
              <TableCell colSpan={columns.length}>Tidak ada penawaran ditemukan.</TableCell>
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
