import { columns } from "@/components/invoices/columns/to-recieve-columns";
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
      paymentId: "REC-2024-001",
      status: "waiting",
      paymentArriveBy: "2024-12-10",
      paymentAmount: 8500.0,
    },
    {
      id: "2",
      company: "TechStart Inc",
      paymentId: "REC-2024-002",
      status: "paid",
      paymentArriveBy: "2024-11-28",
      paymentAmount: 3200.5,
    },
    {
      id: "3",
      company: "Global Industries",
      paymentId: "REC-2024-003",
      status: "failure",
      paymentArriveBy: "2024-11-25",
      paymentAmount: 12750.0,
    },
    {
      id: "4",
      company: "SmallBiz LLC",
      paymentId: "REC-2024-004",
      status: "waiting",
      paymentArriveBy: "2024-12-05",
      paymentAmount: 2150.75,
    },
    {
      id: "5",
      company: "Enterprise Solutions",
      paymentId: "REC-2024-005",
      status: "paid",
      paymentArriveBy: "2024-10-20",
      paymentAmount: 15800.0,
    },
    {
      id: "6",
      company: "Digital Dynamics",
      paymentId: "REC-2024-006",
      status: "waiting",
      paymentArriveBy: "2024-12-15",
      paymentAmount: 6400.25,
    },
  ];
}

export default async function IncomingPaymentsPage() {
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
          <h1 className="text-2xl font-bold mb-4">Incoming Payments</h1>
         <DataTable columns={columns} data={data} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
