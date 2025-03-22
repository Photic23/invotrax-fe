import { ColumnDef } from "@tanstack/react-table";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Plus,
  X,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StockUpdateModal } from "./update-stok-modal";

interface Product {
  id: number;
  nama: string;
  kategori_detail: { id: number; nama: string };
  vendor_detail: { id: number; company_name: string };
  stok: number;
  harga: number;
}

interface Category {
  id: number;
  nama: string;
}

interface Supplier {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  company_name: string;
  role: string;
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

export default function ProductTable() {
  const token = useAuthToken();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchName, setSearchName] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [showAlert, setShowAlert] = useState(true);

  // New state for categories and suppliers
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      setLoading(true);

      try {
        // Fetch products
        const productsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/produk/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const productsData = await productsResponse.json();
        setProducts(productsData);
        setFilteredProducts(productsData);

        const lowStock = productsData.filter(
          (product: Product) => product.stok < 5
        );
        setLowStockProducts(lowStock);
        if (lowStock.length > 0) {
          setShowAlert(true);
        }

        // Fetch categories
        const categoriesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manajemen_stok/kategori/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch suppliers
        const suppliersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admins/users/?role=vendor`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      setLoading(false);
    }

    fetchData();
  }, [token]);

  // Apply filters when search, category, or supplier changes
  useEffect(() => {
    let filtered = [...products];

    // Apply name filter
    if (searchName.trim()) {
      filtered = filtered.filter((product) =>
        product.nama.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== null) {
      filtered = filtered.filter(
        (product) => product.kategori_detail?.id === selectedCategory
      );
    }

    // Apply supplier filter
    if (selectedSupplier !== null) {
      filtered = filtered.filter(
        (product) => product.vendor_detail?.id === selectedSupplier
      );
    }

    setFilteredProducts(filtered);
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchName, selectedCategory, selectedSupplier, products]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSupplier(null);
  };

  const handleUpdateStock = (productId: number, newStock: number) => {
    // Update local state
    const updatedProducts = products.map((product) =>
      product.id === productId ? { ...product, stok: newStock } : product
    );

    setProducts(updatedProducts);
  };

  const openStockModal = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // Prevent row click
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
    },
    {
      accessorKey: "nama",
      header: "Nama",
      enableSorting: true,
    },
    {
      accessorFn: (row) => row.kategori_detail?.nama || "-",
      id: "kategori",
      header: "Kategori",
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.vendor_detail?.company_name || "-",
      id: "supplier",
      header: "Supplier",
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "stok",
      header: "Stok",
      enableSorting: true,
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <span>{info.getValue<number>()}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => openStockModal(e, info.row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "harga",
      header: "Harga",
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const hargaA = rowA.getValue<number>(columnId);
        const hargaB = rowB.getValue<number>(columnId);
        return hargaA - hargaB;
      },
      cell: (info) => `Rp ${info.getValue<number>().toLocaleString()}`,
    },
  ];

  const [sorting, setSorting] = useState([{ id: "id", desc: false }]);

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: false,
    enableSorting: true,
  });

  // Calculate pagination information
  const { pageIndex, pageSize } = pagination;
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div className="space-y-4">
      {showAlert && lowStockProducts.length > 0 && (
        <Alert variant="destructive">
          <div className="flex w-full items-center justify-between">
            <div>
              <AlertTitle>Stok Hampir Habis!</AlertTitle>
              <AlertDescription className="flex flex-wrap gap-2">
                {lowStockProducts.map((product, index) => (
                  <span key={product.id}>
                    {product.nama} ({product.stok})
                    {index < lowStockProducts.length - 1 ? ", " : ""}
                  </span>
                ))}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAlert(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
        <div className="flex flex-1 items-center gap-2">
          <Input
            type="text"
            placeholder="Cari nama produk..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full"
          />

          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {(selectedCategory !== null || selectedSupplier !== null) && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {(selectedCategory !== null ? 1 : 0) +
                      (selectedSupplier !== null ? 1 : 0)}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4 p-2">
                <h4 className="font-medium mb-2">Filter Produk</h4>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori</label>
                  <Select
                    value={selectedCategory?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedCategory(value ? parseInt(value) : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua kategori</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Supplier</label>
                  <Select
                    value={selectedSupplier?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedSupplier(value ? parseInt(value) : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua supplier</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier.id}
                          value={supplier.id.toString()}
                        >
                          {supplier.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    Terapkan
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={() => router.push("/produk/create")}>
          <Plus className="w-2 h-2 mr-1" /> Tambah Produk
        </Button>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory !== null || selectedSupplier !== null) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Filter aktif:</span>

          {selectedCategory !== null && (
            <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
              <span>
                Kategori:{" "}
                {categories.find((c) => c.id === selectedCategory)?.nama}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() => setSelectedCategory(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {selectedSupplier !== null && (
            <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
              <span>
                Supplier:{" "}
                {suppliers.find((s) => s.id === selectedSupplier)?.company_name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() => setSelectedSupplier(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:bg-transparent hover:text-gray-700"
            onClick={clearFilters}
          >
            Hapus semua
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`cursor-pointer select-none min-w-[150px] w-[150px]`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc" && (
                      <ArrowUp className="h-4 w-4" />
                    )}
                    {header.column.getIsSorted() === "desc" && (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-6 text-gray-500"
              >
                <p className="text-lg font-medium">Loading...</p>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => router.push(`/produk/${row.original.id}`)}
                className="cursor-pointer hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-8 text-gray-500"
              >
                <p className="text-lg font-medium">Produk tidak ditemukan</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              Menampilkan {totalItems > 0 ? startItem : 0}-{endItem} dari{" "}
              {totalItems} produk
            </p>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-700">Tampilkan</p>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  const newSize = Number(value);
                  setPagination({
                    pageIndex: 0,
                    pageSize: newSize,
                  });
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
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
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">
                Halaman {pageIndex + 1} dari {totalPages || 1}
              </span>
            </div>
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

      {/* Stock Update Modal */}
      {selectedProduct && (
        <StockUpdateModal
          product={selectedProduct}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleUpdateStock}
        />
      )}
    </div>
  );
}
