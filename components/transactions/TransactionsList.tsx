import React from "react";
import Link from "next/link";
import TransactionItem, { TransactionItemProps } from "./TransactionItem";

type TransactionsListProps = {
  title?: string;
  items: TransactionItemProps[];
  onViewAll?: () => void;
  viewAllHref?: string;
  linkBase?: string; // when set, rows link to `${linkBase}/${id}`
};

export default function TransactionsList({ title = "Transactions", items, onViewAll, viewAllHref, linkBase }: TransactionsListProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold leading-6">{title}</h2>
        {viewAllHref ? (
          <Link href={viewAllHref} className="text-[14px] underline underline-offset-2 text-gray-700">
            View all
          </Link>
        ) : onViewAll ? (
          <button type="button" onClick={onViewAll} className="text-[14px] underline underline-offset-2 text-gray-700">View all</button>
        ) : null}
      </div>
      <div>
        {items.map((it) => (
          <div key={it.id} className="border-b last:border-b-0 border-gray-100">
            <TransactionItem {...it} href={it.href ?? (linkBase ? `${linkBase}/${it.id}` : undefined)} />
          </div>
        ))}
      </div>
    </section>
  );
}


