"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Sheet({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg">{children}</div>;
}

export function SheetTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SheetContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("fixed z-50 gap-4 border bg-background p-6 shadow-lg", className)}>{children}</div>;
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-2 text-center sm:text-left">{children}</div>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-foreground">{children}</h3>;
}

export function SheetDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function SheetFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full justify-end space-x-2">{children}</div>;
}