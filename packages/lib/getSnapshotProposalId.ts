/**
 * Get Snapshot proposal ID from URL
 * @param url Snapshot proposal URL
 * @returns Snapshot proposal ID
 */
const getSnapshotProposalId = (url: string): string | null => {
  if (!url) {
    return null;
  }

  const parsedUrl = new URL(url);
  const proposalId = parsedUrl.hash.match(/\/proposal\/(0x[\dA-Fa-f]{64})/);

  if (parsedUrl.host !== 'snapshot.org') {
    return null;
  }

  return proposalId?.[1] || null;
};

export default getSnapshotProposalId;
