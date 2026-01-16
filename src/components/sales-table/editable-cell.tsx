"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | null;
  orderId: number;
  field: "cpf" | "cnpj";
  onSave: (id: number, field: string, value: string) => Promise<boolean>;
  formatFn?: (value: string | null) => string;
}

// CPF mask: ###.###.###-##
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

// CNPJ mask: ##.###.###/####-##
const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, "").slice(0, 14);
  return numbers
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

export function EditableCell({
  value,
  orderId,
  field,
  onSave,
  formatFn,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const maskFn = field === "cpf" ? formatCPF : formatCNPJ;
  const expectedLength = field === "cpf" ? 14 : 18; // With mask characters

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(value || "");
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setError(null);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskFn(e.target.value);
    setEditValue(masked);
    setError(null);
  };

  const handleSave = async () => {
    // Validate length
    if (editValue && editValue.length !== expectedLength) {
      setError(
        field === "cpf"
          ? "CPF deve ter 11 dígitos"
          : "CNPJ deve ter 14 dígitos"
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(orderId, field, editValue);
      setIsEditing(false);
    } catch {
      setError("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const displayValue = formatFn ? formatFn(value) : value || "-";

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-8 w-36 text-sm",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          placeholder={field === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
          disabled={isSaving}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 text-green-600" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
        {error && (
          <span className="text-xs text-red-500 absolute top-full left-0 mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-1">
      <span className="max-w-[120px] truncate" title={displayValue}>
        {displayValue}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleEdit}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
}
