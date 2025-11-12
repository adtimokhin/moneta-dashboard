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

const ALL_COMPANIES = [
  {
    id: "c-001",
    name: "OceanLink Bunkering",
    country: "United States of America",
    city: "Houston",
    type: "Seller",
  },
  {
    id: "c-002",
    name: "Poseidon Shipping Ltd.",
    country: "United Kingdom",
    city: "London",
    type: "Buyer",
  },
  {
    id: "c-003",
    name: "StraitFuel DMCC",
    country: "United Arab Emirates",
    city: "Dubai",
    type: "Seller",
  },
  {
    id: "c-004",
    name: "Baltic Carriers",
    country: "Denmark",
    city: "Copenhagen",
    type: "Buyer",
  },
  {
    id: "c-005",
    name: "Caspian Marine",
    country: "Kazakhstan",
    city: "Atyrau",
    type: "Buyer",
  },
  {
    id: "c-006",
    name: "HarborFuel Traders",
    country: "United States of America",
    city: "New York",
    type: "Seller",
  },
];

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

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (countryFilter) params.set("country", countryFilter);
    if (search) params.set("q", search);
    if (view === "map") params.set("view", "map");
    router.replace(
      `/companies${params.toString() ? `?${params.toString()}` : ""}`
    );
  }, [view, search, countryFilter, router]);

  const filtered = ALL_COMPANIES.filter((c) => {
    const byCountry = countryFilter
      ? normalize(c.country) === normalize(countryFilter)
      : true;
    const q = normalize(search);
    const bySearch = q
      ? [c.name, c.country, c.city, c.type].some((v) =>
          normalize(v).includes(q)
        )
      : true;
    return byCountry && bySearch;
  });

  const byCountry = React.useMemo(() => {
    const map = new Map();
    for (const c of ALL_COMPANIES) {
      if (!map.has(c.country)) map.set(c.country, []);
      map.get(c.country).push(c);
    }
    return map;
  }, []);

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
            placeholder="Search by name, country, city, type…"
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
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="w-[140px]">Type</TableHead>
                  <TableHead className="w-[140px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No companies match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <button
                          className="underline underline-offset-2 hover:opacity-80"
                          onClick={() => {
                            setCountryFilter(c.country);
                            setView("table");
                          }}
                        >
                          {c.country}
                        </button>
                      </TableCell>
                      <TableCell>{c.city}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.type === "Seller" ? "default" : "secondary"
                          }
                        >
                          {c.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" asChild>
                          <Link href={`/companies/${encodeURIComponent(c.id)}`}>
                            Open
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{ALL_COMPANIES.length}</strong> companies
            {countryFilter ? (
              <>
                {" "}
                • filtered by <strong>{countryFilter}</strong>
              </>
            ) : null}
            {search ? (
              <>
                {" "}
                • query “<strong>{search}</strong>”
              </>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
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
              {Array.from(byCountry.entries()).map(([country, companies]) => {
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
                          {companies.slice(0, 5).map((c) => (
                            <li key={c.id}>{c.name}</li>
                          ))}
                        </ul>
                        {companies.length > 5 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            +{companies.length - 5} more…
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
                {unique(ALL_COMPANIES.map((c) => c.country)).length}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
