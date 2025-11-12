import { columns } from "@/components/invoices/columns/to-pay-columns";
import { DataTable } from "@/components/invoices/data-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

async function getData() {
  // Replace this with your actual API call
  return [
    {
      id: "1",
      company: "Acme Corporation",
      paymentId: "INV-2024-001",
      status: "waiting",
      paymentDue: "2024-12-15",
      paymentAmount: 5420.0,
    },
    {
      id: "2",
      company: "TechStart Inc",
      paymentId: "INV-2024-002",
      status: "paid",
      paymentDue: "2024-11-30",
      paymentAmount: 2100.5,
    },
    {
      id: "3",
      company: "Global Industries",
      paymentId: "INV-2024-003",
      status: "failure",
      paymentDue: "2024-11-20",
      paymentAmount: 8750.0,
    },
    {
      id: "4",
      company: "SmallBiz LLC",
      paymentId: "INV-2024-004",
      status: "waiting",
      paymentDue: "2024-12-01",
      paymentAmount: 1250.75,
    },
    {
      id: "5",
      company: "Enterprise Solutions",
      paymentId: "INV-2024-005",
      status: "paid",
      paymentDue: "2024-10-15",
      paymentAmount: 12500.0,
    },
  ];
}

export default async function InvoicesPage() {
  const data = await getData();

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="container mx-auto py-10">
          <h1 className="text-2xl font-bold mb-4">Invoice Payments</h1>
          <DataTable columns={columns} data={data} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
