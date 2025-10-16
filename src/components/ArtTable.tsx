// src/components/ArtTable.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { fetchArtworksPage, Artwork } from '../api/artApi.ts';
import { useSelectionTracker } from '../hooks/useSelectionTracker.ts';
import  SelectionPanel from './SelectionPanel.tsx';

type PageMeta = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
};

export default function ArtTable() {
  const PAGE_SIZE = 12;
  const [rows, setRows] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, totalPages: 1, total: 0, limit: PAGE_SIZE });
  

  // core selection tracker (persist key optional)
  const sel = useSelectionTracker('art-selection-v1');

  // initialize tracker (hydrate) once
  useEffect(() => {
    sel.init();
  }, []); // eslint-disable-line

  // IMPORTANT: fetch on every page change
  const fetchPage = async (page: number) => {
    setLoading(true);
    try {
      
      const resp = await fetchArtworksPage(page, PAGE_SIZE);
      setRows(resp.data); // only store current page rows — never accumulate pages
      const total = resp.pagination.total ?? 0;
      const limit = resp.pagination.limit ?? PAGE_SIZE;
      const totalPages = (resp.pagination.total_pages ?? Math.ceil(total / limit)) || 1;

      setMeta({ page, totalPages, total, limit });
      // do NOT store rows anywhere else
    } catch (e) {
      console.error('fetchPage error', e);
      // show user-friendly message in real app; keep minimal here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load page 1
    fetchPage(1);
  }, []); // eslint-disable-line

  // derived: which rows on this page are currently selected according to tracker
  const selectedOnPage = useMemo(() => sel.selectedOnPage(rows), [rows, sel]);

  // Handlers for DataTable selection changes: DataTable gives selected row objects for current page
  const onSelectionChange = (e: { value: Artwork[] }) => {
    // e.value is the array of selected rows on THIS page.
    // We'll mark those as selected; rows not in e.value but previously selected on this page
    // must be marked deselected.
    const newlySelectedIds = new Set(e.value.map(r => r.id));
    // mark selected present in e.value
    for (const id of newlySelectedIds) sel.markSelected(id);
    // mark deselected: for rows in current page not in newlySelectedIds
    for (const r of rows) {
      if (!newlySelectedIds.has(r.id)) sel.markDeselected(r.id);
    }
  };

  // Page change handler invoked by UI (prev/next)
  const goToPage = (page: number) => {
    if (page < 1 || page > meta.totalPages) return;
    fetchPage(page);
  };

  // overlay actions
  const handleSelectAllOnPage = () => {
    sel.selectAllOnPage(rows);
    // re-render will be triggered by sel internals (selectedCount state)
  };
  const handleDeselectAllOnPage = () => {
    sel.deselectAllOnPage(rows);
  };
  const handleClearAll = () => {
    sel.clearAll();
  };

  // Example auto-select: select first N rows of next page(s).
  // For simplicity, this function will fetch next page(s) sequentially until it accumulates count.
  const handleAutoSelectNext = async (count: number) => {
    // naive approach: iterate next pages until we collect `count` new ids
    // human-like: we keep it simple, not a hyper-optimized solution
    let collected = 0;
    let p = meta.page + 1;
    while (collected < count && p <= meta.totalPages) {
      // fetch page but don't store it globally
      const resp = await fetchArtworksPage(p, PAGE_SIZE);
      const batch = resp.data;
      // append selection for items on that page
      for (const r of batch) {
        if (collected >= count) break;
        if (!sel.isSelected(r.id)) {
          sel.markSelected(r.id);
          collected++;
        }
      }
      p++;
      // Note: we do not setRows(batch) here because we are not navigating to that page.
    }
    // After auto-select, we might want to reload current page to reflect selection state
    // because DataTable selection rendering depends on rows currently in state.
    await fetchPage(meta.page);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Artworks — page {meta.page} / {meta.totalPages}</h2>

      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button label="Prev" onClick={() => goToPage(meta.page - 1)} disabled={meta.page <= 1} />
        <Button label="Next" onClick={() => goToPage(meta.page + 1)} disabled={meta.page >= meta.totalPages} />
        <div style={{ marginLeft: 'auto' }}>
          <SelectionPanel
            selectedCount={sel.getSelectedCount()}
            onSelectAllOnPage={handleSelectAllOnPage}
            onDeselectAllOnPage={handleDeselectAllOnPage}
            onClearAll={handleClearAll}
            onAutoSelectNext={handleAutoSelectNext}
          />
        </div>
      </div>

      <DataTable
        value={rows}
        dataKey="id"
        selectionMode="multiple"
        selection={selectedOnPage}
        onSelectionChange={onSelectionChange}
        paginator={false} // we handle pagination outside via API calls; prime paginator can be used as well
        loading={loading}
        responsiveLayout="scroll"
        emptyMessage="No records found"
      >
        <Column selectionMode="multiple" style={{ width: '3em' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
      </DataTable>

      <div style={{ marginTop: 12 }}>
        <small>Note: current page rows stored only in component state (no global rows kept).</small>
      </div>
    </div>
  );
}
