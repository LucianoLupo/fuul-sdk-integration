"use client";

import { useEffect, useState } from "react";
import { MyCustomModal } from "./MyCustomModal";
import { NFTCard } from "./NFTCard";
import { useAccount } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { Category, NFTMetaData, getMetadataFromIPFS, tokenIDsMock } from "~~/utils/nftsMockedData";
import { notification } from "~~/utils/scaffold-eth";

export interface Collectible extends Partial<NFTMetaData> {
  id: number;
  owner: string;
  nftInfo: readonly [number, bigint, bigint, bigint, boolean];
  category: string;
}

export const MyHoldings = () => {
  const { address: connectedAddress } = useAccount();
  const [myAllCollectibles, setMyAllCollectibles] = useState<Collectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);

  const { data: testNFT, isLoading } = useScaffoldContract({
    contractName: "TestNFT",
  });

  useEffect(() => {
    const updateMyCollectibles = async (): Promise<void> => {
      if (isLoading || testNFT === undefined || connectedAddress === undefined) return;

      setAllCollectiblesLoading(true);
      const collectibleUpdate: Collectible[] = [];

      for (let index = 0; index < tokenIDsMock.length; index++) {
        const element = tokenIDsMock[index];
        try {
          const nftInfo = await testNFT.read.nftInfo([BigInt(element)]);
          const nftMetadata: NFTMetaData | null = getMetadataFromIPFS(element);
          collectibleUpdate.push({
            owner: connectedAddress,
            nftInfo,
            category: Category[nftInfo[0]],
            ...nftMetadata,
          });
        } catch (e) {
          notification.error("Error fetching all collectibles");
          setAllCollectiblesLoading(false);
        }
      }

      collectibleUpdate.sort((a, b) => a.id - b.id);
      setMyAllCollectibles(collectibleUpdate);
      setAllCollectiblesLoading(false);
    };

    updateMyCollectibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, connectedAddress]);

  if (allCollectiblesLoading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <>
      {myAllCollectibles.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <div className="text-2xl text-primary-content">No NFTs found</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
          {myAllCollectibles.map(item => (
            <NFTCard nft={item} key={item.id} />
          ))}
        </div>
      )}
      <MyCustomModal address={connectedAddress} modalId="fuul-modal" />
    </>
  );
};
