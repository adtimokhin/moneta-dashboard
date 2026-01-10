"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSearchCompanies } from "@/lib/api/schemas/company/hooks";
import { Skeleton } from "@/components/ui/skeleton";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);
const Tooltip = dynamic(() => import("react-leaflet").then((m) => m.Tooltip), {
  ssr: false,
});

const COUNTRY_CENTROIDS = {
  "United States of America": [37.8, -96],
  "United Kingdom": [55, -3],
  "United Arab Emirates": [24, 54],
  Denmark: [56, 10],
  Kazakhstan: [48, 68],
  Canada: [56, -106],
  Mexico: [23, -102],
  Brazil: [-10, -55],
  Argentina: [-34, -64],
  Chile: [-30, -71],
  Peru: [-10, -76],
  Colombia: [4, -73],
  "South Africa": [-30, 25],
  Nigeria: [9.6, 8.1],
  Kenya: [0.4, 37.9],
  Egypt: [26.8, 30.8],
  Morocco: [31.8, -7.1],
  Spain: [40, -4],
  France: [46, 2],
  Germany: [51, 10],
  Netherlands: [52.1, 5.3],
  Belgium: [50.5, 4.5],
  Italy: [42.5, 12.5],
  Greece: [39, 22],
  Turkey: [39, 35],
  Norway: [61, 8],
  Sweden: [62, 15],
  Finland: [64, 26],
  Poland: [52, 19],
  Ukraine: [49, 32],
  Russia: [60, 90],
  China: [35, 103],
  Japan: [36, 138],
  "South Korea": [36.5, 128],
  India: [21, 78],
  Singapore: [1.35, 103.8],
  Indonesia: [-2, 118],
  Australia: [-25, 133],
  "New Zealand": [-41, 174],
  "Saudi Arabia": [24, 45],
  Qatar: [25.3, 51.2],
  Bahrain: [26.05, 50.55],
  Oman: [20.6, 56.1],
  "United Republic of Tanzania": [-6, 35],
  Vietnam: [16, 106],
  Thailand: [15, 101],
  Malaysia: [4, 102],
  Philippines: [13, 122],
  US: [37.8, -96],
  GB: [55, -3],
  AE: [24, 54],
  DK: [56, 10],
  KZ: [48, 68],
  CA: [56, -106],
  MX: [23, -102],
  BR: [-10, -55],
  AR: [-34, -64],
  CL: [-30, -71],
  PE: [-10, -76],
  CO: [4, -73],
  ZA: [-30, 25],
  NG: [9.6, 8.1],
  KE: [0.4, 37.9],
  EG: [26.8, 30.8],
  MA: [31.8, -7.1],
  ES: [40, -4],
  FR: [46, 2],
  DE: [51, 10],
  NL: [52.1, 5.3],
  BE: [50.5, 4.5],
  IT: [42.5, 12.5],
  GR: [39, 22],
  TR: [39, 35],
  NO: [61, 8],
  SE: [62, 15],
  FI: [64, 26],
  PL: [52, 19],
  UA: [49, 32],
  RU: [60, 90],
  CN: [35, 103],
  JP: [36, 138],
  KR: [36.5, 128],
  IN: [21, 78],
  SG: [1.35, 103.8],
  ID: [-2, 118],
  AU: [-25, 133],
  NZ: [-41, 174],
  SA: [24, 45],
  QA: [25.3, 51.2],
  BH: [26.05, 50.55],
  OM: [20.6, 56.1],
  TZ: [-6, 35],
  VN: [16, 106],
  TH: [15, 101],
  MY: [4, 102],
  PH: [13, 122],
};

const normalize = (s) => (s || "").toLowerCase().trim();
const unique = (arr) => Array.from(new Set(arr));

function useQuery() {
  const sp = useSearchParams();
  return React.useMemo(
    () => Object.fromEntries(Array.from(sp.entries())),
    [sp]
  );
}

export default function CompaniesPage() {
  const router = useRouter();
  const query = useQuery();
  const initialCountry = query.country ? decodeURIComponent(query.country) : "";
  const initialView = query.view === "map" ? "map" : "table";
  const [view, setView] = React.useState(initialView);
  const [search, setSearch] = React.useState(
    query.q ? decodeURIComponent(query.q) : ""
  );
  const [countryFilter, setCountryFilter] = React.useState(initialCountry);

  // Fetch companies with addresses included for map display
  // Limit to 100 companies for memory safety
  const searchFilters = React.useMemo(() => ({
    limit: 100,
    sort: "-createdAt",
  }), []);

  const { data: companies = [], isLoading, error } = useSearchCompanies(
    searchFilters,
    ["addresses"] // Pass include as second parameter to the hook
  );

  React.useEffect(() => {
    console.log("=== [Companies Page] Data Update ===");
    console.log("[Companies Page] isLoading:", isLoading);
    console.log("[Companies Page] error:", error);
    console.log("[Companies Page] companies count:", companies.length);

    if (companies.length > 0) {
      console.log("[Companies Page] First company:", companies[0]);
      console.log("[Companies Page] First company addresses:", companies[0].addresses);

      const withAddresses = companies.filter(c => c.addresses && c.addresses.length > 0);
      console.log("[Companies Page] Companies WITH addresses:", withAddresses.length);
      console.log("[Companies Page] Companies WITHOUT addresses:", companies.length - withAddresses.length);

      if (withAddresses.length > 0) {
        console.log("[Companies Page] Sample company with addresses:", withAddresses[0]);
      }
    }
    console.log("=== [Companies Page] Data Update END ===");
  }, [companies, isLoading, error]);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (countryFilter) params.set("country", countryFilter);
    if (search) params.set("q", search);
    if (view === "map") params.set("view", "map");
    router.replace(
      `/companies${params.toString() ? `?${params.toString()}` : ""}`
    );
  }, [view, search, countryFilter, router]);

  // Filter companies with addresses for map display
  const companiesWithAddresses = React.useMemo(() => {
    return companies.filter((c) => c.addresses && c.addresses.length > 0);
  }, [companies]);

  // Client-side filtering
  const filtered = React.useMemo(() => {
    return companiesWithAddresses.filter((c) => {
      const firstAddress = c.addresses?.[0];
      const byCountry = countryFilter
        ? normalize(firstAddress?.country || "") === normalize(countryFilter)
        : true;
      const q = normalize(search);
      const bySearch = q
        ? [
            c.legalName,
            c.tradeName,
            firstAddress?.country || "",
            firstAddress?.city || "",
          ].some((v) => normalize(v).includes(q))
        : true;
      return byCountry && bySearch;
    });
  }, [companiesWithAddresses, countryFilter, search]);

  // Group companies by country for map
  const byCountry = React.useMemo(() => {
    const map = new Map();
    for (const c of companiesWithAddresses) {
      const country = c.addresses?.[0]?.country;
      if (!country) continue;
      if (!map.has(country)) map.set(country, []);
      map.get(country).push(c);
    }
    return map;
  }, [companiesWithAddresses]);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <h2 className="font-semibold">Error loading companies</h2>
          <p className="text-sm mt-1">{error.message || "An error occurred"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Registered Companies</h1>
          <p className="text-sm text-muted-foreground">
            Browse all companies on the platform. Toggle the map to see country
            coverage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="w-72"
            placeholder="Search by name, country, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {countryFilter ? (
            <Badge variant="secondary" className="flex items-center gap-2">
              {countryFilter}
              <button
                className="text-xs opacity-70 hover:opacity-100"
                onClick={() => setCountryFilter("")}
              >
                ✕
              </button>
            </Badge>
          ) : null}
        </div>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">Company</TableHead>
                  <TableHead>Trade Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="w-[140px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No companies match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => {
                    const firstAddress = c.addresses?.[0];
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.legalName}</TableCell>
                        <TableCell>{c.tradeName || "—"}</TableCell>
                        <TableCell>
                          {firstAddress?.country ? (
                            <button
                              className="underline underline-offset-2 hover:opacity-80"
                              onClick={() => {
                                setCountryFilter(firstAddress.country);
                                setView("table");
                              }}
                            >
                              {firstAddress.country}
                            </button>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{firstAddress?.city || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" asChild>
                            <Link href={`/companies/${encodeURIComponent(c.id)}`}>
                              Open
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{companiesWithAddresses.length}</strong> companies
            {countryFilter ? (
              <>
                {" "}
                • filtered by <strong>{countryFilter}</strong>
              </>
            ) : null}
            {search ? (
              <>
                {" "}
                • query "<strong>{search}</strong>"
              </>
            ) : null}
            {companies.length > companiesWithAddresses.length && (
              <span className="text-muted-foreground">
                {" "}
                • {companies.length - companiesWithAddresses.length} companies without addresses excluded from map
              </span>
            )}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          {isLoading ? (
            <div className="rounded-xl border p-4">
              <Skeleton className="h-[520px] w-full" />
            </div>
          ) : (
            <>
              <div className="relative rounded-xl border overflow-hidden">
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  scrollWheelZoom
                  style={{ height: 520, width: "100%" }}
                  className="bg-muted"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {Array.from(byCountry.entries()).map(([country, companyList]) => {
                    const coord = COUNTRY_CENTROIDS[country];
                    if (!coord) return null;
                    return (
                      <CircleMarker
                        key={country}
                        center={coord}
                        radius={6}
                        pathOptions={{
                          color: "#111827",
                          weight: 1,
                          fillOpacity: 0.9,
                        }}
                        eventHandlers={{
                          click: () => {
                            setCountryFilter(country);
                            setView("table");
                          },
                        }}
                      >
                        <Tooltip
                          direction="top"
                          offset={[0, -6]}
                          opacity={1}
                          permanent={false}
                        >
                          <div className="text-sm">
                            <div className="font-medium">{country}</div>
                            <ul className="list-disc pl-4">
                              {companyList.slice(0, 5).map((c) => (
                                <li key={c.id}>{c.legalName}</li>
                              ))}
                            </ul>
                            {companyList.length > 5 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                +{companyList.length - 5} more…
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              Click to filter table
                            </div>
                          </div>
                        </Tooltip>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <div>
                  Countries with companies:{" "}
                  <strong>
                    {unique(Array.from(byCountry.keys())).length}
                  </strong>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("table")}
                >
                  Go to table
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
