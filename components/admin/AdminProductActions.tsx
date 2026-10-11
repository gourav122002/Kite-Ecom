"use client";

import { deleteProductAction } from "@/server/actions/adminActions";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function AdminDeleteProductButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      setLoading(true);
      await deleteProductAction(id);
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
      title="Delete Product"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
