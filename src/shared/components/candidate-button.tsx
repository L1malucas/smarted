"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "@/shared/components/ui/use-toast";

export function CandidateButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/public");
  };

  return (
    <Button variant="outline" className="w-full mt-2" onClick={handleClick}>
      Sou Candidato
    </Button>
  );
}
