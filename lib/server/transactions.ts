export interface TxRow {
  id: number;
  label: string;
  amount: number;
  amountRaw: number;
  balanceBefore: number;
  balanceAfter: number;
  date: string;
  status: "สำเร็จ" | "รอดำเนินการ" | "ยกเลิก";
}

export async function getTransactionsByTab(_userId: string, _tabId: string): Promise<TxRow[]> {
  // DB has been removed from transactions flow for now.
  // Return empty list until API-based source is wired in.
  return [];
}
