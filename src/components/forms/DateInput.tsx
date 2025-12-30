"use client"

import * as React from "react"
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form"
import { DatePicker } from "@/components/ui/date-picker"
import { format, parse } from "date-fns"

interface DateInputProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function DateInput<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder = "日付を選択",
  required = false,
  disabled = false,
  error,
  className,
}: DateInputProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        // 文字列（YYYY-MM-DD形式）をDateオブジェクトに変換
        const dateValue = field.value
          ? typeof field.value === "string"
            ? parse(field.value, "yyyy-MM-dd", new Date())
            : field.value && typeof field.value === "object" && (field.value as unknown) instanceof Date
            ? field.value as Date
            : typeof field.value === "number" || (typeof field.value === "string" && !isNaN(Date.parse(field.value)))
            ? new Date(field.value as string | number)
            : undefined
          : undefined

        return (
          <div className={className}>
            {label && (
              <label
                htmlFor={name}
                className="block text-sm font-medium text-black mb-2"
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <DatePicker
              date={dateValue}
              onSelect={(date) => {
                // Dateオブジェクトを文字列（YYYY-MM-DD形式）に変換
                if (date) {
                  field.onChange(format(date, "yyyy-MM-dd"))
                } else {
                  field.onChange("")
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
            />
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>
        )
      }}
    />
  )
}

