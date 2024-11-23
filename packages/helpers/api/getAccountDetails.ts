import { HEY_API_URL } from "@hey/data/constants";
import type { AccountDetails } from "@hey/types/hey";
import axios from "axios";

export const GET_ACCOUNT_DETAILS_QUERY_KEY = "getAccountDetails";

/**
 * Get account details
 * @param id account id
 * @returns account details
 */
const getAccountDetails = async (
  id: string
): Promise<null | AccountDetails> => {
  try {
    const { data } = await axios.get(`${HEY_API_URL}/profile/get`, {
      params: { id }
    });

    return data.result;
  } catch {
    return null;
  }
};

export default getAccountDetails;