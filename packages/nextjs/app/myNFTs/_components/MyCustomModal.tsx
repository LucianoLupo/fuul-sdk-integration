import CopyToClipboard from "react-copy-to-clipboard";
import { Address as AddressType } from "viem";
import { ClipboardDocumentIcon, ShareIcon } from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

type MyCustomModalProps = {
  address: AddressType | undefined;
  modalId: string;
};

export const MyCustomModal = ({ address, modalId }: MyCustomModalProps) => {
  //lupo0x comment: gonna keep this easy, and use the window because this runs on client, but probably the url should come from within the SDK
  //something like  Fuul.getUri or something...
  const fullUrl = `${window.location.origin}?referrer=${address}`;
  const fuulSDKInfo = useGlobalState(({ infoFromSDKInit }) => infoFromSDKInit);
  const handleCopy = () => {
    notification.success("Referral link copied!");
  };

  return (
    <>
      <div>
        <input type="checkbox" id={`${modalId}`} className="modal-toggle" />
        <label htmlFor={`${modalId}`} className="modal cursor-pointer">
          <label className="modal-box relative">
            {/* dummy input to capture event onclick on modal box */}
            <input className="h-0 w-0 absolute top-0 left-0" />
            <label htmlFor={`${modalId}`} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
              ✕
            </label>
            <div className="space-y-3 py-6">
              <div className="alert bg-base-200 shadow-lg">
                <ShareIcon className="h-6 w-6" />
                <div>
                  <h3 className="font-bold">Share & Earn!</h3>
                  <p className="text-sm">Invite friends to mint NFTs and earn bonus points!</p>
                </div>
              </div>

              <div className="rounded-2xl py-6 bg-base-200 shadow-lg ">
                <div className="w-full min-w-full	">
                  <h3 className="font-bold text-center w-full">{fuulSDKInfo?.name}</h3>
                  <p className="text-sm text-center">Is Awesome</p>
                </div>
              </div>

              <span className="text-sm opacity-75">Your Referral Link</span>
              <div className="flex items-center gap-2">
                <code className="bg-base-200 p-3 rounded-lg block break-all flex-1">{fullUrl}</code>
                <CopyToClipboard text={fullUrl} onCopy={handleCopy}>
                  <button className="btn btn-primary btn-square">
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </CopyToClipboard>
              </div>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};
