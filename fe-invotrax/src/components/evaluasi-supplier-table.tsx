import { ColumnDef } from "@tanstack/react-table";
import { SortingState } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EvaluasiSupplier {
  supplier_id: number;
  supplier_company_name: string;
  evaluation_id?: number;
  rating: number | string;
  rank: number | string;
  evaluation_allowed: boolean;
  update_allowed: boolean;
  readonly_detail: boolean;
}

function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  return token;
}

export function EvaluasiSupplierTable() {
  const token = useAuthToken();
  const router = useRouter();

  const [data, setData] = useState<EvaluasiSupplier[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [quarter, setQuarter] = useState<number>(
    Math.floor((new Date().getMonth()) / 3) + 1
  );
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/evaluasi_supplier/evaluasi-supplier/daftar_evaluasi/?year=${year}&quarter=${quarter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [token, year, quarter]);

  const clearFilters = () => {
    setYear(new Date().getFullYear());
    setQuarter(Math.floor((new Date().getMonth()) / 3) + 1);
  };

  const columns: ColumnDef<EvaluasiSupplier>[] = [
    {
      accessorKey: "rank",
      header: "Rank",
      enableSorting: true,
    },
    {
      accessorKey: "supplier_company_name",
      header: "Supplier",
      enableSorting: true,
    },
    {
      accessorKey: "rating",
      header: "Score",
      enableSorting: true,
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const r = row.original;
      
        if (r.evaluation_allowed) {
          return (
            <Button
              size="sm"
              onClick={() =>
                router.push(`/evaluasi-supplier/${r.supplier_id}/create`)
              }
            >
              Evaluasi
            </Button>
          );
        }
      
        if (r.update_allowed) {
          return (
            <Button
              size="sm"
              onClick={() =>
                router.push(`/evaluasi-supplier/${r.evaluation_id}/update`)
              }
            >
              Update
            </Button>
          );
        }
      
        if (r.readonly_detail) {
          return (
            <Button
              size="sm"
              onClick={() =>
                router.push(`/evaluasi-supplier/${r.evaluation_id}/update`)
              }
            >
              Detail
            </Button>
          );
        }
      
        return (
          <Button size="sm" disabled>
            Evaluasi
          </Button>
        );
      },          
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: false,
    enableSorting: true,
  });

  const { pageIndex, pageSize } = pagination;
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-4 p-2">
              <h4 className="font-medium mb-2">Filter Periode</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tahun</label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quarter</label>
                <Select
                  value={quarter.toString()}
                  onValueChange={(v) => setQuarter(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead
                  key={h.id}
                  className="cursor-pointer select-none"
                  onClick={h.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" && <ArrowUp className="h-4 w-4" />}
                    {h.column.getIsSorted() === "desc" && <ArrowDown className="h-4 w-4" />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-6">
                Loading...
              </TableCell>
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
              <TableCell colSpan={columns.length} className="text-center py-8">
                Tidak ada data Supplier untuk quarter ini
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              Menampilkan {totalItems > 0 ? startItem : 0}-{endItem} dari {totalItems}
            </p>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-700">Tampilkan</p>
              <Select
                value={pageSize.toString()}
                onValueChange={(v) =>
                  setPagination({ pageIndex: 0, pageSize: Number(v) })
                }
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map((sz) => (
                    <SelectItem key={sz} value={sz.toString()}>
                      {sz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Halaman {pageIndex + 1} dari {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluasiSupplierTable;