import type { AnyPublication } from '@hey/lens';

import { Errors } from '@hey/data';
import { TIP_API_URL } from '@hey/data/constants';
import formatDate from '@hey/lib/datetime/formatDate';
import humanize from '@hey/lib/humanize';
import { Button, HelpTooltip, Input } from '@hey/ui';
import errorToast from '@lib/errorToast';
import getAuthApiHeaders from '@lib/getAuthApiHeaders';
import axios from 'axios';
import { type FC, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import usePreventScrollOnNumberInput from 'src/hooks/usePreventScrollOnNumberInput';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import { useProfileRestriction } from 'src/store/non-persisted/useProfileRestriction';
import { useTipsStore } from 'src/store/non-persisted/useTipsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

interface ActionProps {
  closePopover: () => void;
  publication: AnyPublication;
  triggerConfetti: () => void;
}

const Action: FC<ActionProps> = ({
  closePopover,
  publication,
  triggerConfetti
}) => {
  const { currentProfile } = useProfileStore();
  const { setShowAuthModal } = useGlobalModalStateStore();
  const {
    addOrUpdatePublicationTip,
    allowanceLeft,
    allowanceResetsAt,
    decreaseAllowance,
    hasAllowance
  } = useTipsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(50);
  const [other, setOther] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  usePreventScrollOnNumberInput(inputRef);

  const { isSuspended } = useProfileRestriction();

  const onSetAmount = (amount: number) => {
    setAmount(amount);
    setOther(false);
  };

  const onOtherAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as unknown as number;

    if (value > (allowanceLeft || 0)) {
      return;
    }

    setAmount(event.target.value as unknown as number);
  };

  const handleTip = async () => {
    if (!currentProfile) {
      closePopover();
      setShowAuthModal(true);
      return;
    }

    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      setIsLoading(true);
      await axios.put(
        `${TIP_API_URL}/tip`,
        {
          amount: parseFloat(amount.toString()),
          publicationId: publication.id,
          toAddress: publication.by.ownedBy.address,
          toProfileId: publication.by.id
        },
        { headers: getAuthApiHeaders() }
      );
      addOrUpdatePublicationTip({ amount, publicationId: publication.id });
      decreaseAllowance(amount);
      closePopover();
      triggerConfetti();
    } catch (error) {
      errorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="m-5 space-y-3">
      {allowanceLeft ? (
        <div className="flex items-center space-x-1">
          <div className="ld-text-gray-500 ml-auto text-xs">
            Allowance: {humanize(allowanceLeft)} Points
          </div>
          <HelpTooltip>
            <b>Good BONSAI Points</b>
            <div className="w-52">
              <div className="flex items-start justify-between">
                <div>Allowance</div>
                <b>{humanize(allowanceLeft)} GBP</b>
              </div>
              <div className="flex items-start justify-between">
                <div>Resets At</div>
                <b>{formatDate(allowanceResetsAt?.toString() as string)}</b>
              </div>
            </div>
          </HelpTooltip>
        </div>
      ) : null}
      <div className="space-x-2">
        <Button
          disabled={!currentProfile}
          onClick={() => onSetAmount(50)}
          outline={amount !== 50}
          size="sm"
        >
          50
        </Button>
        <Button
          disabled={!currentProfile}
          onClick={() => onSetAmount(100)}
          outline={amount !== 100}
          size="sm"
        >
          100
        </Button>
        <Button
          disabled={!currentProfile}
          onClick={() => onSetAmount(200)}
          outline={amount !== 200}
          size="sm"
        >
          200
        </Button>
        <Button
          disabled={!currentProfile}
          onClick={() => {
            onSetAmount(other ? 50 : 300);
            setOther(!other);
          }}
          outline={!other}
          size="sm"
        >
          Other
        </Button>
      </div>
      {other ? (
        <div>
          <Input
            className="no-spinner"
            max={allowanceLeft || 0}
            min={1}
            onChange={onOtherAmount}
            placeholder="300"
            ref={inputRef}
            type="number"
            value={amount}
          />
        </div>
      ) : null}
      {currentProfile ? (
        <Button
          className="w-full"
          disabled={amount < 1 || isLoading || !hasAllowance()}
          onClick={handleTip}
        >
          {hasAllowance() ? `Tip ${amount} Points` : 'No Allowance'}
        </Button>
      ) : (
        <Button className="w-full" onClick={handleTip}>
          Log in to tip
        </Button>
      )}
    </div>
  );
};

export default Action;
