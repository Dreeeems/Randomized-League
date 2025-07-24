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

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchLatestVersion = async (): Promise<string> => {
    try {
      const response = await fetch(
        "https://ddragon.leagueoflegends.com/api/versions.json"
      );
      const versions = await response.json();
      return versions[0];
    } catch (error) {
      console.error("Error fetching versions:", error);
      return "13.24.1";
    }
  };

  const fetchGameData = async () => {
    try {
      setLoading(true);
      const latestVersion = await fetchLatestVersion();
      console.log(latestVersion);
      setVersion(latestVersion);

      const championsResponse = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
      );
      const championsData = await championsResponse.json();
      const championsList = Object.values(championsData.data) as Champion[];
      setChampion(championsList);

      const itemsResponse = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/item.json`
      );
      const itemsData = await itemsResponse.json();
      const itemsList = Object.entries(itemsData.data)
        .map(([id, item]: [string, any]) => ({
          id,
          ...item,
        }))
        .filter((item: any) => item.gold?.total > 0 && item.maps?.[11]); // Only items available on Summoner's Rift
      setItems(itemsList);

      const runesResponse = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/runesReforged.json`
      );
      const runesData = await runesResponse.json();
      setRuneTrees(runesData);

      generateRandomBuild(championsList, itemsList, runesData);
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomBuild = (
    champList = champion,
    itemList = items,
    runeList = runeTrees
  ) => {
    setGenerating(true);

    setTimeout(() => {
      const randomChampion =
        champList[Math.floor(Math.random() * champList.length)];
      setSelectedChampion(randomChampion);

      const shuffledItems = [...itemList].sort(() => 0.5 - Math.random());
      setSelectedItems(shuffledItems.slice(0, 6));

      const primaryTree = runeList[Math.floor(Math.random() * runeList.length)];
      let secondaryTree = runeList[Math.floor(Math.random() * runeList.length)];
      while (secondaryTree.id === primaryTree.id) {
        secondaryTree = runeList[Math.floor(Math.random() * runeList.length)];
      }

      const selectedRunesList: Rune[] = [];

      const keystone =
        primaryTree.slots[0].runes[
          Math.floor(Math.random() * primaryTree.slots[0].runes.length)
        ];
      selectedRunesList.push(keystone);

      for (let i = 1; i < Math.min(3, primaryTree.slots.length); i++) {
        const rune =
          primaryTree.slots[i].runes[
            Math.floor(Math.random() * primaryTree.slots[i].runes.length)
          ];
        selectedRunesList.push(rune);
      }

      const availableSecondarySlots = secondaryTree.slots.slice(1); // Skip keystone slot
      for (let i = 0; i < Math.min(2, availableSecondarySlots.length); i++) {
        const rune =
          availableSecondarySlots[i].runes[
            Math.floor(Math.random() * availableSecondarySlots[i].runes.length)
          ];
        selectedRunesList.push(rune);
      }

      setSelectedRunes(selectedRunesList);
      setGenerating(false);
    }, 500);
  };

  console.log(selectedChampion, selectedItems, selectedRunes);
}
