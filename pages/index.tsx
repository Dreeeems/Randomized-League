"use client";
import { useState, useEffect } from "react";
import { Loader2, Shuffle, Sword, Shield, Zap } from "lucide-react";
import Image from "next/image";

interface Champion {
  id: string;
  name: string;
  title: string;
  image: {
    full: string;
  };
  tags: string[];
}

interface Item {
  name: string;
  description: string;
  image: {
    full: string;
  };
  gold: {
    total: number;
  };
  tags: string[];
}

interface Rune {
  id: number;
  name: string;
  shortDesc: string;
  icon: string;
}

interface RuneTree {
  id: number;
  name: string;
  icon: string;
  slots: {
    runes: Rune[];
  }[];
}

export default function Home() {
  const [champion, setChampion] = useState<Champion[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [runeTrees, setRuneTrees] = useState<RuneTree[]>([]);

  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(
    null
  );
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [selectedRunes, setSelectedRunes] = useState<Rune[]>([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [version, setVersion] = useState<string>("");
}
