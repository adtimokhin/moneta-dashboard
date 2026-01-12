"use client";

import * as React from "react";
import {
  IconBuilding,
  IconCash,
  IconCreditCardPay,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconReceipt,
  IconSearch,
  IconSettings,
  IconShoppingCart,
  IconTags,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Instruments",
      url: "/instruments",
      icon: IconReceipt,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  listings: [
    {
      name: "My Listings",
      url: "/listings",
      icon: IconTags,
    },
    {
      name: "Market",
      url: "/listings/market",
      icon: IconShoppingCart,
    },
    {
      name: "Track Listings",
      url: "/listings/track",
      icon: IconCreditCardPay,
    },
  ],
  payments: [
    {
      name: "Overview",
      url: "/payments",
      icon: IconCash,
    },
    {
      name: "Paying",
      url: "/payments/track/paying",
      icon: IconCreditCardPay,
    },
    {
      name: "Receiving",
      url: "/payments/track/receiving",
      icon: IconReceipt,
    },
  ],
  organization: [
    {
      name: "Members",
      url: "/members",
      icon: IconUsers,
    },
    {
      name: "Companies",
      url: "/companies",
      icon: IconBuilding,
    },
    {
      name: "Documents",
      url: "/documents",
      icon: IconFileDescription,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments title={"Listings"} items={data.listings} />
        <NavDocuments title={"Payments"} items={data.payments} />
        <NavDocuments title={"Organization"} items={data.organization} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
