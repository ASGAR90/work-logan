import { blocksClient } from "../../lib/blocks/client";

// Schema name, not collection name -- the gateway generates `getWorkLogs`
// (querySchema) and `insertWorkLog`/`updateWorkLog`/`deleteWorkLog` from it.
const SCHEMA = "WorkLog";

export type WorkLog = {
  ItemId?: string;
  itemId?: string;
  businessUnit?: string;
  projectOrClient?: string;
  hours?: number;
  // ISO calendar date, `yyyy-MM-dd`. Stored as a plain string rather than a
  // DateTime so a log always belongs to the day the person picked, regardless
  // of the timezone their browser happens to be in.
  workDate?: string;
  notes?: string;
  CreatedBy?: string;
  CreatedDate?: string;
};

export type WorkLogInput = {
  businessUnit: string;
  projectOrClient: string;
  hours: number;
  workDate: string;
  notes?: string;
};

const workLogs = blocksClient.data.collection<WorkLog>(SCHEMA, {
  fields: ["businessUnit", "projectOrClient", "hours", "workDate", "notes", "CreatedBy", "CreatedDate"]
});

export function workLogId(entry: WorkLog): string {
  const id = entry.ItemId ?? entry.itemId;
  if (!id) throw new Error("Work log item id is missing.");
  return String(id);
}

/**
 * The summary views group and total entries locally, so they need the whole
 * set rather than one page of it. Paging is still done against the gateway --
 * this just walks every page instead of stopping at the first.
 */
export async function listAllWorkLogs(): Promise<WorkLog[]> {
  const pageSize = 100;
  const all: WorkLog[] = [];

  for (let pageNo = 1; ; pageNo += 1) {
    const { items, totalCount } = normalizeList(await workLogs.list({ pageNo, pageSize }));
    all.push(...items);
    if (items.length < pageSize || all.length >= totalCount) break;
    // Defensive stop: a gateway that ignores paging would otherwise loop forever.
    if (pageNo > 100) break;
  }

  return all;
}

export function createWorkLog(input: WorkLogInput) {
  return workLogs.create(input);
}

export function updateWorkLog(id: string, input: WorkLogInput) {
  return workLogs.update(id, input);
}

export function deleteWorkLog(id: string) {
  return workLogs.delete(id);
}

function normalizeList(response: unknown): { items: WorkLog[]; totalCount: number } {
  const record = response as {
    data?: { getWorkLogs?: { items?: WorkLog[]; totalCount?: number }; items?: WorkLog[]; totalCount?: number };
    items?: WorkLog[];
    totalCount?: number;
  };
  const gateway = record.data?.getWorkLogs;
  const items = gateway?.items ?? record.data?.items ?? record.items ?? [];
  return {
    items,
    totalCount: gateway?.totalCount ?? record.data?.totalCount ?? record.totalCount ?? items.length
  };
}
