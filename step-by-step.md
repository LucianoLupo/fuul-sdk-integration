# Step by step process for Fuul SDK integration Test/Challenge

Main idea of the step by step is to share my thought process, share why I 've made some decisions and direct the focus to what I think is the most important part.

## Why?

Well... because it shows how I tackle problems, but to be honest is mainly because I will write a blog about it at the end of the process ( without the company's name of course ) and I will rather write it now that I have the project fresh in my mind.

## Let's start

For this project I've to:

- Make a simple SDK ( like a "hello world" type of SDK ) and integrate it within a React project.
- SDK should expose only an init function that requires an apiKey
- The React project should show NFTs and after mocked "Succesfull mint" should show a modal with data from the SDK

**Disclaimer:** I think adapt your brain to an existing codebase and implement new features using only the stuff is already there and following the structure and patterns already implemented is difficult but is the correct way. On the other hand enter into a project and do your own ( install new libraries, create new modal structures, change state libraries, etc... ) or even claim that project should be started again is easy but is wrong... You first adapt your mind to understand project completly and then you make Request For Comments ( RFCs ) with your opinions and the reasoning behind what you think should be changed, discuss, plan, and implement...

Went to a conference this month and found out this thing called [SpeedRun Ethereum](https://speedrunethereum.com/), according to people in the conference, it seems to be a respected project, so last weekend I went thru the challenges there and joined the BuidlGuidl, you can check my profile [here](https://app.buidlguidl.com/builders/0xb0f3248777E6E241bb2B26A2bf49828550797c87) I'm gonna use their playground for this Test/Challenge.

## First of all.. how the heck I start an SDK ?

Went to Google for a bit:

[https://huddle01.hashnode.dev/the-complete-guide-to-building-sdks](https://huddle01.hashnode.dev/the-complete-guide-to-building-sdks)
[https://dev.to/mendoza/how-to-build-a-simple-sdk-on-typescript-21gg](https://dev.to/mendoza/how-to-build-a-simple-sdk-on-typescript-21gg)
[https://durgadas.in/building-an-sdk-with-typescript](https://durgadas.in/building-an-sdk-with-typescript)
[https://github.com/egoist/tsup](https://github.com/egoist/tsup)
and more...

And after some reading I thought it will be enough for a simple SDK, started my `package.json` like this:

```javascript
{
  "name": "@lupo0x/mysdk",
  "version": "0.2.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}

```

You can check the full code [here](https://github.com/LucianoLupo/fuul-sdk-integration/tree/main/packages/sdk), but main part is this:

```javascript

// .... imports and stuff ....

export class Fuul {
  private projectInfo: ProjectInfo | null = null;
  private config: FuulConfig | null = null;

  constructor(config?: FuulConfig) {
    if (config) {
      void this.init(config);
    }
  }

  async init(config: FuulConfig): Promise<ProjectInfo> {
    if (!config?.apiKey) throw new Error(`ApiKey needed to initialize`);
    this.config = config;

    try {
      this.projectInfo = await fetchMockedData(config.apiKey);
      return this.projectInfo;
    } catch (error) {
      throw new Error(`Failed to initialize`);
    }
  }

//.... more stuff ...

```

the spec of the Test/Challenge said specifically that init function will return the fetched data, best practice for frontend is to init all the libraries, clients, SDKs, etc... ouside the render cycle, but async fetches should be conducted inside render cycle... gonna visit this in the frontend part but that is why the config is conditional in the constructor.

## The NextJS part

First I went thru the whole project ( or most of it ...) to see how they do things, they have a really good set of features related to debugging and integrating contracts but that is all in their docs so not gonna explain that here.

A really nice thing they have is that you can ( on localhost ) use burner wallet right on... [here](https://speedrunethereum.com/challenge/simple-nft-example) you can read about the burner wallets, not gonna copy paste from the awesome people from speedrun ethereum.

Inside `app` folder I will add a new page called `myNFTs` with all the things needed for this Test/Challenge,

```
nextjs/
├── app/
│   ├── blockexplorer/
│   ├── debug/
│   └── myNFTs/
│       ├── _components/
│       │   ├── MyCustomModal.tsx
│       │   ├── MyHoldings.tsx
│       │   ├── NFTCard.tsx
│       │   └── index.ts
│       ├── layout.tsx
│       └── page.tsx

```

Also I should start the SDK in the layout, but the project already initialize stuff in the `ScaffoldEthAppWithProviders` component so will put it there, check it [here](https://github.com/LucianoLupo/fuul-sdk-integration/blob/94096d2d3865355394c31879d74b533d7b19aae7/packages/nextjs/components/ScaffoldEthAppWithProviders.tsx#L41)

```javascript

//... stuff ...
const sdkClient = new Fuul();

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const setInfoFromSDKInit = useGlobalState(({ setInfoFromSDKInit }) => setInfoFromSDKInit);

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initAppWithProviders = async (): Promise<void> => {
      if (setInfoFromSDKInit === undefined) return;
      const initAndReturnData = await sdkClient.init({
        apiKey: "mySuperAwesomePublicApiKey",
      });
      setInfoFromSDKInit(initAndReturnData);
      setMounted(true);
    };
    initAppWithProviders();
  }, [setInfoFromSDKInit]);
//... more stuff ...
```

They use zustand for state management, I've used quite a lot in the recent years and I think is the best for react state management, so after fetching the mocked data, it gets saved on global state for later use.

I can write more about the scaffold structue ( and probably I will... ) but for now lets jump to the NFT minting part

## Minting NFT and referral modal

IMAGE HERE

IMAGE HERE

here is where the magic happens:

```javascript

  const handleMintItem = async () => {
    const notificationId = notification.loading("Minting in progress....");
    try {
      // First remove previous loading notification and then show success notification
      notification.remove(notificationId);
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

```

Daisy UI has this particular way of handle open and close for modals, you can read more [here](https://daisyui.com/components/modal/) but basically they handle it thru html which to me sounds like a radical Idea, check this [Medium Post](https://medium.com/techverito/building-scalable-react-modal-component-with-custom-hook-%EF%B8%8F-tailwindcss-daisyui-and-ae12fbd7521c) about it.

I've a couple of comments here:

- First of all, the way Scaffold ETH handles modals is already deprecated according to DaisyUI, so if this was a real project I would start and RFC ( if I feel like it I will start a discussion on their repo ).
- And about the modal handling I'm more use to Zustand management for global modals, I wrote a blog about it that you can read [here](https://www.lucianolupo.com/posts/zustand-modals)

## Integration

```
├── node_modules/
├── packages/
│   ├── hardhat/
│   ├── nextjs/
│   └── sdk/
├── .gitignore
├── .lintstagerc.js
├── .yarnrc.yml
├── CONTRIBUTING.md
├── LICENCE
├── package-lock.json
└── package.json

```

with that Scaffold everything under packages folder will be taken as workspace and thanks to this:

```javascript
//...package.json stuff...

  "workspaces": {
    "packages": [
      "packages/*"
    ]
  },

//...more package.json stuff...
```

so it is super easy to build

```javascript
//...package.json stuff...

    "next:serve": "yarn workspace @se-2/nextjs serve",
    "sdk:build": "yarn workspace @lupo0x/mysdk build",
    "precommit": "lint-staged",

//...more package.json stuff...
```

and to install in the nextjs project:

```javascript
//...package.json stuff...

  "dependencies": {
    "@heroicons/react": "~2.1.5",
    "@lupo0x/mysdk": "file:../sdk",
    "@rainbow-me/rainbowkit": "2.1.6",

//...more package.json stuff...
```

## Create the NFT solidity file

Of course this was not required but I wanted to do it anyway, for my blog I will expand on it, but for now the important thing is that scaffold eth has a really helpfull script under `99_generateTsAbis.ts` that automatically push the abi and address to the nextjs project folder, so you don't have to manually copy/paste ABIs ! really cool feature.

```
packages/
└── hardhat/
    ├── artifacts/
    ├── cache/
    ├── contracts/
    ├── deploy/
    │   ├── 00_deploy_your_contract.ts
    │   └── 99_generateTsAbis.ts
```

Also it allows you to verify your contract so [here](https://sepolia-optimism.etherscan.io/address/0x3A65B59bB336cf4209612540c1402b0908409586) it is verified in optimism sepolia
