import IndexStatus from "@components/Shared/IndexStatus";
import errorToast from "@helpers/errorToast";
import { Leafwatch } from "@helpers/leafwatch";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { LensHandles } from "@hey/abis";
import { LENS_HANDLES } from "@hey/data/constants";
import { Errors } from "@hey/data/errors";
import { SETTINGS } from "@hey/data/tracking";
import {
  Button,
  Card,
  CardHeader,
  H5,
  Modal,
  Spinner,
  WarningMessage
} from "@hey/ui";
import type { FC } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import useHandleWrongNetwork from "src/hooks/useHandleWrongNetwork";
import { useAccountStore } from "src/store/persisted/useAccountStore";
import { useWriteContract } from "wagmi";

const HandleGuardianSettings: FC = () => {
  const { currentAccount } = useAccountStore();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleWrongNetwork = useHandleWrongNetwork();
  const isProtected = currentAccount?.handle?.guardian?.protected;

  const onError = (error: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const { data, writeContractAsync } = useWriteContract({
    mutation: {
      onError: (error: Error) => onError(error),
      onSuccess: () => Leafwatch.track(SETTINGS.DANGER.UNPROTECT_HANDLE)
    }
  });

  const write = async () => {
    return await writeContractAsync({
      abi: LensHandles,
      address: LENS_HANDLES,
      functionName: isProtected
        ? "DANGER__disableTokenGuardian"
        : "enableTokenGuardian"
    });
  };

  const handleDisable = async () => {
    if (!currentAccount) {
      return toast.error(Errors.SignWallet);
    }

    try {
      setIsLoading(true);
      await handleWrongNetwork();

      return await write();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Card>
      <CardHeader
        body={
          isProtected
            ? "This will disable the Handle Guardian and allow you to do some actions like transfer, burn and approve without restrictions."
            : "This will enable the Handle Guardian and restrict you from doing some actions like transfer, burn and approve."
        }
        title={
          <div className="text-red-500">
            {isProtected ? "Disable" : "Enable"} handle guardian
          </div>
        }
      />
      <div className="m-5 space-y-5">
        {isProtected && (
          <>
            <H5>What else you should know</H5>
            <div className="ld-text-gray-500 divide-y text-sm dark:divide-gray-700">
              <p className="pb-3">
                A 24-hours Security Cooldown Period need to be elapsed for the
                Handle Guardian to become effectively disabled.
              </p>
              <p className="py-3">
                After the Handle Guardian is effectively disabled, you will be
                able to execute approvals and transfers without restrictions.
              </p>
            </div>
          </>
        )}
        {data ? (
          <div className="mt-5">
            <IndexStatus shouldReload txHash={data} />
          </div>
        ) : (
          <Button
            disabled={isLoading}
            icon={
              isLoading ? (
                <Spinner size="xs" variant="danger" />
              ) : isProtected ? (
                <LockOpenIcon className="size-5" />
              ) : (
                <LockClosedIcon className="size-5" />
              )
            }
            onClick={() =>
              isProtected ? setShowWarningModal(true) : handleDisable()
            }
            variant="danger"
          >
            {isProtected
              ? isLoading
                ? "Disabling..."
                : "Disable now"
              : isLoading
                ? "Enabling..."
                : "Enable now"}
          </Button>
        )}
      </div>
      <Modal
        onClose={() => setShowWarningModal(false)}
        show={showWarningModal}
        title="Danger zone"
      >
        <div className="space-y-3 p-5">
          <WarningMessage
            message={
              <div className="leading-6">
                Confirm that you have read all consequences and want to disable
                the Handle Guardian.
              </div>
            }
            title="Are you sure?"
          />
          <Button
            icon={<LockOpenIcon className="size-5" />}
            onClick={async () => {
              setShowWarningModal(false);
              await handleDisable();
            }}
            variant="danger"
          >
            Yes, disable
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default HandleGuardianSettings;
