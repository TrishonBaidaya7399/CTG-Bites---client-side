"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AppetizerSelectionOption {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

interface AppetizerSelectionTableProps {
  appetizers: AppetizerSelectionOption[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

const DESCRIPTION_EXPAND_THRESHOLD = 80;

function AppetizerRow({
  appetizer,
  isSelected,
  onToggle,
}: {
  appetizer: AppetizerSelectionOption;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const description = appetizer.description ?? "";
  const canExpand = description.length > DESCRIPTION_EXPAND_THRESHOLD;

  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition-colors",
        isSelected ? "bg-brand-orange/5 border-brand-orange/30" : "bg-white border-brand-warm-gray hover:border-brand-orange/30"
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(appetizer.id)}
        className="mt-1.5 accent-brand-orange w-4 h-4 shrink-0"
      />
      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-brand-warm-gray relative">
        <Image src={appetizer.image} alt={appetizer.name} fill sizes="56px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-serif text-sm font-bold text-brand-brown truncate">{appetizer.name}</p>
          <span className="font-sans text-sm font-bold text-brand-orange shrink-0">৳{appetizer.price}</span>
        </div>
        {description && (
          <>
            <p className={cn("font-sans text-xs text-brand-brown-mid mt-1", !expanded && "line-clamp-2")}>
              {description}
            </p>
            {canExpand && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setExpanded((v) => !v); }}
                className="font-sans text-xs font-semibold text-brand-orange mt-0.5"
              >
                {expanded ? "See less" : "See more"}
              </button>
            )}
          </>
        )}
      </div>
    </label>
  );
}

export function AppetizerSelectionTable({ appetizers, selectedIds, onToggle }: AppetizerSelectionTableProps) {
  if (appetizers.length === 0) return null;

  return (
    <div>
      <p className="font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
        Add Appetizers
      </p>
      <div className="space-y-2">
        {appetizers.map((a) => (
          <AppetizerRow key={a.id} appetizer={a} isSelected={selectedIds.has(a.id)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
