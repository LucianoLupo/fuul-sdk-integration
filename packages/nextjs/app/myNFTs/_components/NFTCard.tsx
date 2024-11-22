import { MyCustomModal } from "./MyCustomModal";
import { Collectible } from "./MyHoldings";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Category } from "~~/utils/nftsMockedData";
import { notification } from "~~/utils/scaffold-eth";

export const NFTCard = ({ nft }: { nft: Collectible }) => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();

  const { data: nftBalance } = useScaffoldReadContract({
    contractName: "TestNFT",
    functionName: "balanceOf",
    args: [connectedAddress, BigInt(nft.id)],
    watch: true,
  });

  const { writeContractAsync } = useScaffoldWriteContract("TestNFT");

  const handleMintItem = async () => {
    const notificationId = notification.loading("Minting in progress....");
    try {
      // First remove previous loading notification and then show success notification
      notification.remove(notificationId);
      console.log(nft.id);
      await writeContractAsync({
        functionName: "mint",
        args: [BigInt(nft.id)],
        value: parseEther("0.01"),
        gas: 1000000n,
      });
      notification.success("Minted!");
      //lupo0x comment: according to daisy UI docs, accesing with document is the right way (will explain more in the walkt thru)
      (document.getElementById("fuul-modal") as HTMLElement).click();
    } catch (error) {
      notification.remove(notificationId);
      console.log(error);
      console.error(error);
    }
  };

  return (
    <div className="card card-compact bg-base-100 shadow-lg w-[300px] shadow-secondary">
      <figure className="relative">
        {/* eslint-disable-next-line  */}
        <img src={nft.image} alt="NFT Image" className="h-60 min-w-full" />
        <figcaption className="glass absolute bottom-4 left-4 p-4 w-25 rounded-xl">
          <span className="text-white ">ID: {nft.id}</span>
        </figcaption>
      </figure>
      <div className="card-body space-y-3">
        <div className="flex items-center justify-center">
          <p className="text-xl p-0 m-0 font-semibold">{nft.name}</p>
          <div className="flex flex-wrap space-x-2 mt-1">
            <span className="badge badge-primary py-3">{Category[nft.nftInfo[0]]}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center mt-1">
          <p className="my-0 text-lg">{nft.description}</p>
        </div>
        <div className="flex  justify-between mt-1">
          <p className="my-0 text-lg">Price </p>
          <p className="my-0 text-lg text-right"> {formatEther(BigInt(nft.nftInfo[3]))} eth</p>
        </div>
        <div className="card-actions justify-between	">
          <p className="text-xl font-semibold">Owned: {String(nftBalance)}</p>

          {!isConnected || isConnecting ? (
            <RainbowKitCustomConnectButton />
          ) : (
            <button className="btn btn-secondary" onClick={handleMintItem}>
              Mint NFT
            </button>
          )}
        </div>
        <label htmlFor="fuul-modal" className="btn-sm !rounded-xl flex gap-3 py-3">
          <span className="whitespace-nowrap">View Modal</span>
        </label>
      </div>
      <MyCustomModal address={connectedAddress} modalId="fuul-modal" />
    </div>
  );
};
