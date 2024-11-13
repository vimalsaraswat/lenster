import QueuedPost from "@components/Publication/QueuedPost";
import SinglePost from "@components/Publication/SinglePost";
import PostsShimmer from "@components/Shared/Shimmer/PostsShimmer";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import type { AnyPublication, PublicationForYouRequest } from "@hey/lens";
import { LimitType, useForYouQuery } from "@hey/lens";
import { OptmisticPublicationType } from "@hey/types/enums";
import { Card, EmptyState, ErrorMessage } from "@hey/ui";
import type { FC } from "react";
import { Virtuoso } from "react-virtuoso";
import { useImpressionsStore } from "src/store/non-persisted/useImpressionsStore";
import { useTipsStore } from "src/store/non-persisted/useTipsStore";
import { useProfileStore } from "src/store/persisted/useProfileStore";
import { useTransactionStore } from "src/store/persisted/useTransactionStore";

const ForYou: FC = () => {
  const { currentProfile } = useProfileStore();
  const { txnQueue } = useTransactionStore();
  const { fetchAndStoreViews } = useImpressionsStore();
  const { fetchAndStoreTips } = useTipsStore();

  const request: PublicationForYouRequest = {
    for: currentProfile?.id,
    limit: LimitType.TwentyFive
  };

  const { data, error, fetchMore, loading } = useForYouQuery({
    onCompleted: async ({ forYou }) => {
      const ids = forYou?.items?.map((p) => p.publication.id) || [];
      await fetchAndStoreViews(ids);
      await fetchAndStoreTips(ids);
    },
    variables: { request }
  });

  const publications = data?.forYou?.items;
  const pageInfo = data?.forYou?.pageInfo;
  const hasMore = pageInfo?.next;

  const onEndReached = async () => {
    if (hasMore) {
      const { data } = await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
      const ids = data?.forYou?.items?.map((p) => p.publication.id) || [];
      await fetchAndStoreViews(ids);
      await fetchAndStoreTips(ids);
    }
  };

  if (loading) {
    return <PostsShimmer />;
  }

  if (publications?.length === 0) {
    return (
      <EmptyState
        icon={<LightBulbIcon className="size-8" />}
        message="No posts yet!"
      />
    );
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load highlights" />;
  }

  return (
    <>
      {txnQueue.map((txn) =>
        txn?.type === OptmisticPublicationType.Post ? (
          <QueuedPost key={txn.txId} txn={txn} />
        ) : null
      )}
      <Card>
        <Virtuoso
          className="virtual-divider-list-window"
          computeItemKey={(index, item) => `${item.publication.id}-${index}`}
          data={publications}
          endReached={onEndReached}
          itemContent={(index, item) => (
            <SinglePost
              isFirst={index === 0}
              isLast={index === (publications?.length || 0) - 1}
              publication={item.publication as AnyPublication}
            />
          )}
          useWindowScroll
        />
      </Card>
    </>
  );
};

export default ForYou;
