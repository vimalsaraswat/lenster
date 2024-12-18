import { describe, expect, test } from "vitest";
import { isCommentPost, isRepost } from "./postHelpers";

describe("postHelpers", () => {
  describe("isRepost", () => {
    test("should return true for Mirror post", () => {
      const post: any = { __typename: "Mirror" };
      expect(isRepost(post)).toBe(true);
    });

    test("should return false for non-Mirror post", () => {
      const post: any = { __typename: "Article" };
      expect(isRepost(post)).toBe(false);
    });

    test("should return false for null", () => {
      const post = null;
      expect(isRepost(post)).toBe(false);
    });
  });

  describe("isCommentPost", () => {
    test("should return true for Comment post", () => {
      const post: any = { __typename: "Comment" };
      expect(isCommentPost(post)).toBe(true);
    });

    test("should return false for non-Comment post", () => {
      const post: any = { __typename: "Article" };
      expect(isCommentPost(post)).toBe(false);
    });
  });
});
