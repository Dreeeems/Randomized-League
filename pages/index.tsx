"use client";

import { useState, useEffect } from "react";
import { Loader2, Shuffle, Sword, Shield, Zap } from "lucide-react";
import Image from "next/image";
import Head from "next/head";

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
  id: string;
  name: string;
  description: string;
  image: {
    full: string;
  };
  gold: {
    total: number;
  };
  tags: string[];
  consumed?: boolean;
  depth?: number;
  maps?: Record<string, boolean>;
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

export default function LoLRandomGenerator() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [legendaryItems, setLegendaryItems] = useState<Item[]>([]);
  const [boots, setBoots] = useState<Item[]>([]);
  const [runeTrees, setRuneTrees] = useState<RuneTree[]>([]);

  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(
    null
  );
  const [selectedLegendaryItems, setSelectedLegendaryItems] = useState<Item[]>(
    []
  );
  const [selectedBoots, setSelectedBoots] = useState<Item | null>(null);
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
      console.error("Error fetching version:", error);
      return "13.24.1";
    }
  };

  const fetchGameData = async () => {
    try {
      setLoading(true);

      const latestVersion = await fetchLatestVersion();
      setVersion(latestVersion);

      const championsResponse = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
      );
      const championsData = await championsResponse.json();
      const championsList = Object.values(championsData.data) as Champion[];
      setChampions(championsList);

      const itemsResponse = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/item.json`
      );
      const itemsData = await itemsResponse.json();

      const allItems = Object.entries(itemsData.data)
        .map(([id, item]) => ({
          ...(item as Item & { maps?: Record<string, boolean> }),
          id,
        }))
        .filter((item) => item.maps?.[11]);

      const legendaryItemsList: Item[] = allItems.filter((item) => {
        return (
          item.gold?.total &&
          item.gold.total >= 3000 &&
          !item.consumed &&
          !item.tags?.includes("Trinket") &&
          !item.tags?.includes("Consumable") &&
          !item.tags?.includes("Boots") &&
          item.depth &&
          item.depth >= 3
        );
      }) as Item[];

      const bootsList: Item[] = allItems.filter((item) => {
        return (
          item.tags?.includes("Boots") &&
          item.gold?.total &&
          item.gold.total > 300 &&
          !item.consumed
        );
      }) as Item[];

      setLegendaryItems(legendaryItemsList);
      setBoots(bootsList);

      const runesResponse = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/runesReforged.json`
      );
      const runesData = await runesResponse.json();
      setRuneTrees(runesData);

      generateRandomBuild(
        championsList,
        legendaryItemsList,
        bootsList,
        runesData
      );
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomBuild = (
    champList = champions,
    legendaryList = legendaryItems,
    bootsList = boots,
    runeList = runeTrees
  ) => {
    setGenerating(true);

    setTimeout(() => {
      const randomChampion =
        champList[Math.floor(Math.random() * champList.length)];
      setSelectedChampion(randomChampion);

      const shuffledLegendaryItems = [...legendaryList].sort(
        () => 0.5 - Math.random()
      );
      setSelectedLegendaryItems(shuffledLegendaryItems.slice(0, 5));

      const randomBoots =
        bootsList[Math.floor(Math.random() * bootsList.length)];
      setSelectedBoots(randomBoots);

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

      for (let i = 1; i < Math.min(4, primaryTree.slots.length); i++) {
        const rune =
          primaryTree.slots[i].runes[
            Math.floor(Math.random() * primaryTree.slots[i].runes.length)
          ];
        selectedRunesList.push(rune);
      }

      const availableSecondarySlots = secondaryTree.slots.slice(1);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading League of Legends data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>LoL Random Generator</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              LoL Random Generator
            </h1>
            <p className="text-xl text-blue-200 mb-6">
              Generate random champions, items, and runes for your next League
              of Legends game!
            </p>
            <button
              onClick={() => generateRandomBuild()}
              disabled={generating}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 hover:cursor-pointer disabled:cursor-not-allowed text-white font-bold px-8 py-3 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
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

            <div className="bg-black/40 border border-green-500/50 backdrop-blur-sm rounded-lg shadow-xl">
              <div className="p-6 text-center border-b border-green-500/30">
                <h2 className="text-2xl text-white flex items-center justify-center gap-2 font-bold">
                  <Shield className="h-6 w-6 text-green-500" />
                  Items
                </h2>
              </div>
              <div className="p-6">
                {selectedLegendaryItems.length > 0 || selectedBoots ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-green-300 mb-2">
                        Legendary Items
                      </h3>
                      <div className="grid grid-cols-5 gap-2">
                        {selectedLegendaryItems.map((item, index) => (
                          <div
                            key={index}
                            className="text-center group relative"
                          >
                            <div className="relative w-10 h-10 mx-auto mb-1">
                              <Image
                                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`}
                                alt={item.name}
                                fill
                                className="rounded border border-green-500/50 group-hover:border-green-400 transition-colors shadow-md"
                              />
                            </div>
                            <p
                              className="text-xs text-white truncate font-medium"
                              title={item.name}
                            >
                              {item.name.split(" ")[0]}
                            </p>
                            <p className="text-xs text-yellow-400 font-bold">
                              {item.gold.total}g
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedBoots && (
                      <div>
                        <h3 className="text-sm font-semibold text-green-300 mb-2">
                          Boots
                        </h3>
                        <div className="flex justify-center">
                          <div className="text-center group relative">
                            <div className="relative w-12 h-12 mx-auto mb-1">
                              <Image
                                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${selectedBoots.image.full}`}
                                alt={selectedBoots.name}
                                fill
                                className="rounded border-2 border-orange-500/70 group-hover:border-orange-400 transition-colors shadow-md"
                              />
                            </div>
                            <p
                              className="text-xs text-white truncate font-medium"
                              title={selectedBoots.name}
                            >
                              {selectedBoots.name}
                            </p>
                            <p className="text-xs text-yellow-400 font-bold">
                              {selectedBoots.gold.total}g
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    No items selected
                  </div>
                )}
              </div>
            </div>

            <div className="bg-black/40 border border-purple-500/50 backdrop-blur-sm rounded-lg shadow-xl">
              <div className="p-6 text-center border-b border-purple-500/30">
                <h2 className="text-2xl text-white flex items-center justify-center gap-2 font-bold">
                  <Zap className="h-6 w-6 text-purple-500" />
                  Runes
                </h2>
              </div>
              <div className="p-6">
                {selectedRunes.length > 0 ? (
                  <div className="space-y-3">
                    {selectedRunes.map((rune, index) => (
                      <div
                        key={rune.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-purple-900/30 border border-purple-700/30 hover:bg-purple-800/30 transition-colors"
                      >
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`}
                            alt={rune.name}
                            fill
                            className="rounded shadow-sm"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-white truncate">
                              {rune.name}
                            </p>
                            {index === 0 && (
                              <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                Keystone
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-purple-200 line-clamp-2 leading-relaxed">
                            {rune.shortDesc.replace(/<[^>]*>/g, "")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    No runes selected
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-8 text-blue-200 text-sm">
            <p className="mb-1 font-bold">
              <a
                href="https://github.com/Dreeeems/Randomized-League"
                target="blank"
              >
                Made by Dreeeems
              </a>
            </p>
            <p>
              Data provided by Riot Games API • League of Legends Random Build
              Generator
            </p>
            {version && (
              <p className="mt-1 text-blue-300">Game Version: {version}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
