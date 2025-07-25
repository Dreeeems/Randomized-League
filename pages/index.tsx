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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradiant-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading League Of Legends data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            LoL Random Generator
          </h1>
          <p className="text-xl text-blue-200 mb-6">
            Generate random champions, items, and runes for your next League of
            Legends game!
          </p>
          <button
            onClick={() => generateRandomBuild()}
            disabled={generating}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto hover:cursor-pointer"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Shuffle className="h-5 w-5" />
                Generate Random Build
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-black/40 border border-blue-500/50 backdrop-blur-sm rounded-lg shadow-xl">
            <div className="p-6 text-center border-b border-blue-500/30">
              <h2 className="text-2xl text-white flex items-center justify-center gap-2 font-bold">
                <Sword className="h-6 w-6 text-yellow-500" />
                Champion
              </h2>
            </div>
            <div className="p-6 text-center">
              {selectedChampion ? (
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${selectedChampion.image.full}`}
                      alt={selectedChampion.name}
                      fill
                      className="rounded-lg object-cover border-2 border-yellow-500 shadow-lg"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedChampion.name}
                    </h3>
                    <p className="text-blue-200 text-sm italic">
                      {selectedChampion.title}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedChampion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-600/50 text-white text-xs px-2 py-1 rounded-full border border-blue-400/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">No champion selected</div>
              )}
            </div>
          </div>
          <div className="bg-black/40  border border-green-500/50 backdrop-blur-sm rounded-lg shadow-xl">
            <div className="p-6 text-center border-b border-green-500/30">
              <h2 className="text-2xl text-white flex items-center justify-center gap-2 font-bold">
                <Shield className="h-6 w-6 text-green-500" />
                Items
              </h2>
            </div>
            <div className="p-6">
              {selectedItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="text-center group relative">
                      <div className="relative w-12 h-12 mx-auto mb-2">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`}
                          alt={item.name}
                          fill
                          className="rounded border border-green-500/5 group-hover:border-green-400 transition-colors shadow-md "
                        />
                      </div>
                      <p
                        className="text-xs  text-white truncate font-medium"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-yellow-400 font-bold">
                        {item.gold.total}g{" "}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  No items selected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
