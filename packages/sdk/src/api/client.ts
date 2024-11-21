import type { ProjectInfo } from "../types";

export const fetchMockedData = async (apiKey: string): Promise<ProjectInfo> => {
  // Mocked response
  //lupo0x comment: apiKey should be use here
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "Fuul NFT Project",
        description: "Exclusive NFT collection with referral rewards",
      });
    }, 200);
  });
};
