"use client";

import { MyHoldings } from "./_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

const MyNFTs: NextPage = () => {
  const { isConnected, isConnecting } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">My NFTs</span>
          </h1>
        </div>
      </div>
      {/*lupo0x comment: here should go some good looking Loader  */}
      {!isConnected || isConnecting ? <p>Loading...</p> : <MyHoldings />}
    </>
  );
};

export default MyNFTs;