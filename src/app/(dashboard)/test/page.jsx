"use client";

import { useState } from "react";
import {
  useSearchInstruments,
  useInstrument,
  useCreateInstrument,
  useUpdateDraftInstrument,
  useTransitionInstrument,
} from "@/lib/api/schemas/instrument"; // adjust path if needed

export default function InstrumentsMegaTester() {
  // -------------------- Shared state --------------------
  const [selectedId, setSelectedId] = useState("");
  const [lastCreated, setLastCreated] = useState(null);

  // -------------------- SEARCH --------------------
  const [searchFilters, setSearchFilters] = useState({
    minFaceValue: "",
    maxFaceValue: "",
    currency: "",
    instrumentStatus: "",
  });

  const searchFiltersPayload = {
    minFaceValue: searchFilters.minFaceValue
      ? Number(searchFilters.minFaceValue)
      : undefined,
    maxFaceValue: searchFilters.maxFaceValue
      ? Number(searchFilters.maxFaceValue)
      : undefined,
    currency: searchFilters.currency || undefined,
    instrumentStatus: searchFilters.instrumentStatus || undefined,
    limit: 20,
    offset: 0,
  };

  const {
    data: searchResults,
    isLoading: isSearching,
    isError: searchError,
    refetch: refetchSearch,
  } = useSearchInstruments(searchFiltersPayload);

  // -------------------- GET BY ID --------------------
  const {
    data: singleInstrument,
    isLoading: isLoadingInstrument,
    isError: isInstrumentError,
    refetch: refetchInstrument,
  } = useInstrument(selectedId || undefined);

  // -------------------- CREATE --------------------
  const [createForm, setCreateForm] = useState({
    name: "Test Instrument",
    faceValue: "100000",
    currency: "USD",
    maturityDate: "2030-01-01",
    maturityPayment: "110000",
  });

  const createMutation = useCreateInstrument();

  // -------------------- UPDATE DRAFT --------------------
  const [updateForm, setUpdateForm] = useState({
    name: "",
    faceValue: "",
    currency: "",
    maturityDate: "",
    maturityPayment: "",
  });

  const updateDraftMutation = useUpdateDraftInstrument();

  // -------------------- TRANSITION STATUS --------------------
  const [transitionStatus, setTransitionStatus] = useState("PENDING_APPROVAL");
  const transitionMutation = useTransitionInstrument();

  // -------------------- Handlers --------------------
  const handleCreate = () => {
    createMutation.mutate(
      {
        name: createForm.name,
        faceValue: Number(createForm.faceValue),
        currency: createForm.currency.toUpperCase(),
        maturityDate: createForm.maturityDate,
        maturityPayment: Number(createForm.maturityPayment),
      },
      {
        onSuccess: (data) => {
          setLastCreated(data);
          if (data?.id) {
            setSelectedId(data.id);
          }
        },
      }
    );
  };

  const handleUpdateDraft = () => {
    if (!selectedId) {
      alert("Set an instrument ID first (e.g. from Create or manual input).");
      return;
    }

    const payload = {};
    if (updateForm.name) payload.name = updateForm.name;
    if (updateForm.faceValue) payload.faceValue = Number(updateForm.faceValue);
    if (updateForm.currency)
      payload.currency = updateForm.currency.toUpperCase();
    if (updateForm.maturityDate) payload.maturityDate = updateForm.maturityDate;
    if (updateForm.maturityPayment)
      payload.maturityPayment = Number(updateForm.maturityPayment);

    if (Object.keys(payload).length === 0) {
      alert("Fill at least one field to update.");
      return;
    }

    updateDraftMutation.mutate({ id: selectedId, data: payload });
  };

  const handleTransition = () => {
    if (!selectedId) {
      alert("Set an instrument ID first (e.g. from Create or manual input).");
      return;
    }
    transitionMutation.mutate({
      id: selectedId,
      body: { newStatus: transitionStatus },
    });
  };

  const handleSearchButton = () => {
    refetchSearch();
  };

  const handleGetByIdButton = () => {
    if (!selectedId) {
      alert("Enter an instrument ID first.");
      return;
    }
    refetchInstrument();
  };

  // -------------------- Render --------------------
  return (
    <div className="space-y-8 rounded border p-4">
      <h2 className="text-lg font-bold">Instruments Mega Tester</h2>

      {/* Shared ID field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Selected Instrument ID
        </label>
        <input
          type="text"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          placeholder="Paste or use a created ID here"
          className="w-full rounded border px-2 py-1 text-sm"
        />
        {lastCreated?.id && (
          <div className="text-xs opacity-70">
            Last created ID: <code>{lastCreated.id}</code>
          </div>
        )}
      </div>

      {/* SEARCH BLOCK */}
      <section className="space-y-3 rounded border p-3">
        <h3 className="text-sm font-semibold">Search Instruments</h3>
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium">Min Face Value</label>
            <input
              type="number"
              value={searchFilters.minFaceValue}
              onChange={(e) =>
                setSearchFilters((f) => ({
                  ...f,
                  minFaceValue: e.target.value,
                }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Max Face Value</label>
            <input
              type="number"
              value={searchFilters.maxFaceValue}
              onChange={(e) =>
                setSearchFilters((f) => ({
                  ...f,
                  maxFaceValue: e.target.value,
                }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Currency</label>
            <input
              type="text"
              value={searchFilters.currency}
              onChange={(e) =>
                setSearchFilters((f) => ({
                  ...f,
                  currency: e.target.value,
                }))
              }
              placeholder="USD, EUR…"
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">
              Instrument Status
            </label>
            <select
              value={searchFilters.instrumentStatus}
              onChange={(e) =>
                setSearchFilters((f) => ({
                  ...f,
                  instrumentStatus: e.target.value,
                }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            >
              <option value="">(any)</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="MATURED">MATURED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSearchButton}
          className="rounded border px-3 py-1 text-xs font-medium"
        >
          Search (POST /instrument/search)
        </button>

        <div className="text-xs">
          {isSearching && <div>Searching…</div>}
          {searchError && <div className="text-red-500">Search failed</div>}
        </div>

        {searchResults && (
          <div className="mt-2 max-h-64 overflow-auto rounded border bg-black/5 p-2 text-[10px]">
            <pre>{JSON.stringify(searchResults, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* GET BY ID BLOCK */}
      <section className="space-y-3 rounded border p-3">
        <h3 className="text-sm font-semibold">Get Instrument by ID</h3>
        <button
          type="button"
          onClick={handleGetByIdButton}
          className="rounded border px-3 py-1 text-xs font-medium"
        >
          Get (GET /instrument/&lt;id&gt;)
        </button>
        <div className="text-xs">
          {isLoadingInstrument && <div>Loading instrument…</div>}
          {isInstrumentError && (
            <div className="text-red-500">Failed to load instrument.</div>
          )}
        </div>
        {singleInstrument && (
          <div className="mt-2 max-h-64 overflow-auto rounded border bg-black/5 p-2 text-[10px]">
            <pre>{JSON.stringify(singleInstrument, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* CREATE BLOCK */}
      <section className="space-y-3 rounded border p-3">
        <h3 className="text-sm font-semibold">Create Instrument</h3>
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium">Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Face Value</label>
            <input
              type="number"
              value={createForm.faceValue}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, faceValue: e.target.value }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Currency</label>
            <input
              type="text"
              value={createForm.currency}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, currency: e.target.value }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Maturity Date</label>
            <input
              type="date"
              value={createForm.maturityDate}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, maturityDate: e.target.value }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">
              Maturity Payment
            </label>
            <input
              type="number"
              value={createForm.maturityPayment}
              onChange={(e) =>
                setCreateForm((f) => ({
                  ...f,
                  maturityPayment: e.target.value,
                }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="rounded border px-3 py-1 text-xs font-medium"
        >
          Create (POST /instrument)
        </button>
        <div className="text-xs">
          {createMutation.isLoading && <div>Creating…</div>}
          {createMutation.isError && (
            <div className="text-red-500">Create failed.</div>
          )}
        </div>
        {lastCreated && (
          <div className="mt-2 max-h-64 overflow-auto rounded border bg-black/5 p-2 text-[10px]">
            <pre>{JSON.stringify(lastCreated, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* UPDATE DRAFT BLOCK */}
      <section className="space-y-3 rounded border p-3">
        <h3 className="text-sm font-semibold">
          Update Drafted Instrument (PATCH)
        </h3>
        <p className="text-xs opacity-70">
          Requires the instrument to be in DRAFT status and belong to the
          current user&apos;s company.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium">Name</label>
            <input
              type="text"
              value={updateForm.name}
              onChange={(e) =>
                setUpdateForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Face Value</label>
            <input
              type="number"
              value={updateForm.faceValue}
              onChange={(e) =>
                setUpdateForm((f) => ({ ...f, faceValue: e.target.value }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Currency</label>
            <input
              type="text"
              value={updateForm.currency}
              onChange={(e) =>
                setUpdateForm((f) => ({ ...f, currency: e.target.value }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Maturity Date</label>
            <input
              type="date"
              value={updateForm.maturityDate}
              onChange={(e) =>
                setUpdateForm((f) => ({
                  ...f,
                  maturityDate: e.target.value,
                }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">
              Maturity Payment
            </label>
            <input
              type="number"
              value={updateForm.maturityPayment}
              onChange={(e) =>
                setUpdateForm((f) => ({
                  ...f,
                  maturityPayment: e.target.value,
                }))
              }
              className="w-full rounded border px-2 py-1 text-xs"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleUpdateDraft}
          className="rounded border px-3 py-1 text-xs font-medium"
        >
          Update Draft (PATCH /instrument/&lt;id&gt;)
        </button>
        <div className="text-xs">
          {updateDraftMutation.isLoading && <div>Updating…</div>}
          {updateDraftMutation.isError && (
            <div className="text-red-500">Update failed.</div>
          )}
        </div>
      </section>

      {/* TRANSITION STATUS BLOCK */}
      <section className="space-y-3 rounded border p-3">
        <h3 className="text-sm font-semibold">Transition Instrument Status</h3>
        <p className="text-xs opacity-70">
          Allowed transitions depend on current status and user role. Common:
          DRAFT → PENDING_APPROVAL, PENDING_APPROVAL → ACTIVE / REJECTED.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={transitionStatus}
            onChange={(e) => setTransitionStatus(e.target.value)}
            className="rounded border px-2 py-1 text-xs"
          >
            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button
            type="button"
            onClick={handleTransition}
            className="rounded border px-3 py-1 text-xs font-medium"
          >
            Transition (POST /instrument/&lt;id&gt;/transition)
          </button>
        </div>
        <div className="text-xs">
          {transitionMutation.isLoading && <div>Transitioning…</div>}
          {transitionMutation.isError && (
            <div className="text-red-500">
              Transition failed (may be invalid transition or permissions).
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
