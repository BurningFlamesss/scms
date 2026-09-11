import {
  Banknote,
  CreditCard,
  FileSignature,
  Landmark,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Invoice, InvoiceStatus, PaymentMethod } from "@/types";

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  card: "Card",
  bank_transfer: "Bank transfer",
  cash: "Cash",
  cheque: "Cheque",
  wallet: "Wallet",
};

export const METHOD_ICON: Record<PaymentMethod, LucideIcon> = {
  card: CreditCard,
  bank_transfer: Landmark,
  cash: Banknote,
  cheque: FileSignature,
  wallet: Wallet,
};

export const METHOD_OPTIONS = (Object.keys(METHOD_LABEL) as PaymentMethod[]).map((value) => ({
  value,
  label: METHOD_LABEL[value],
}));

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
  overdue: "Overdue",
  void: "Void",
};

export const INVOICE_STATUS_OPTIONS = [
  { value: "all", label: "Any status" },
  ...(Object.keys(INVOICE_STATUS_LABEL) as InvoiceStatus[]).map((value) => ({
    value,
    label: INVOICE_STATUS_LABEL[value],
  })),
];

export const RECEIPT_STATUS_OPTIONS = [
  { value: "all", label: "Any status" },
  { value: "succeeded", label: "Succeeded" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export const FREQUENCY_LABEL: Record<"annual" | "term" | "monthly", string> = {
  annual: "Annual",
  term: "Per term",
  monthly: "Monthly",
};

export function balanceOf(invoice: Invoice): number {
  return Math.max(0, invoice.amount - invoice.amountPaid);
}

export function paidShare(invoice: Invoice): number {
  if (invoice.amount <= 0) return 0;
  return Math.min(100, Math.round((invoice.amountPaid / invoice.amount) * 100));
}

/** Positive = overdue by N days, negative = due in N days. */
export function daysPastDue(dueDate: string): number {
  const due = new Date(`${dueDate.slice(0, 10)}T00:00:00`).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - due) / 86400000);
}

export function dueDescriptor(invoice: Invoice): { label: string; tone: string } {
  if (invoice.status === "paid") return { label: "Settled", tone: "text-success" };
  if (invoice.status === "void") return { label: "Voided", tone: "text-muted-foreground" };
  const days = daysPastDue(invoice.dueDate);
  if (days > 0) {
    return { label: `${days} day${days === 1 ? "" : "s"} overdue`, tone: "text-destructive" };
  }
  if (days === 0) return { label: "Due today", tone: "text-warning" };
  const ahead = Math.abs(days);
  return { label: `Due in ${ahead} day${ahead === 1 ? "" : "s"}`, tone: "text-muted-foreground" };
}

export function rateTone(rate: number): string {
  if (rate >= 90) return "text-success";
  if (rate >= 75) return "text-foreground";
  if (rate >= 60) return "text-warning";
  return "text-destructive";
}

/** Mock gateway test cards surfaced on the checkout screen. */
export const DEMO_CARDS = [
  { number: "4242 4242 4242 4242", outcome: "Payment succeeds" },
  { number: "4000 0000 0000 0002", outcome: "Card declined" },
];

export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
