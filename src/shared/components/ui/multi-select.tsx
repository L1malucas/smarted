
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Command } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { CommandInput, CommandEmpty, CommandGroup, CommandItem } from "cmdk";
import { Button } from "@/shared/components/ui/button";


interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onSelectedChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ options, selected, onSelectedChange, placeholder, className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onSelectedChange(newSelected);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selected.length === 0
            ? placeholder || "Select options..."
            : selected.map((value) => {
                const option = options.find((o) => o.value === value);
                return option ? <Badge key={value} variant="secondary" className="mr-1">{option.label}</Badge> : null;
              })}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
                className="flex items-center justify-between"
              >
                {option.label}
                <Check
                  className={cn(
                    "h-4 w-4",
                    selected.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
