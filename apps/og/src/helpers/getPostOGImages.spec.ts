import getPostData from "@hey/helpers/getPostData";
import { beforeEach, describe, expect, test, vi } from "vitest";
import getPostOGImages from "./getPostOGImages";

vi.mock("@hey/helpers/getPostData", () => ({
  default: vi.fn()
}));

describe("getPostOGImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return image URIs from attachments when asset is an image", () => {
    const mockMetadata = { __typename: "ImageMetadata" } as any;
    const mockPostData = {
      attachments: [
        { uri: "https://example.com/image1.jpg" },
        { uri: "https://example.com/image2.jpg" }
      ],
      asset: { type: "Image", uri: "https://example.com/asset-image.jpg" }
    };

    (getPostData as any).mockReturnValue(mockPostData);

    const result = getPostOGImages(mockMetadata);
    expect(result).toEqual([
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]);
  });

  test("should return asset image URI when no attachments are present", () => {
    const mockMetadata = { __typename: "ImageMetadata" } as any;
    const mockPostData = {
      attachments: [],
      asset: { type: "Image", uri: "https://example.com/asset-image.jpg" }
    };

    (getPostData as any).mockReturnValue(mockPostData);

    const result = getPostOGImages(mockMetadata);
    expect(result).toEqual(["https://example.com/asset-image.jpg"]);
  });

  test("should return video cover URI when no attachments are present", () => {
    const mockMetadata = { __typename: "VideoMetadata" } as any;
    const mockPostData = {
      attachments: [],
      asset: { type: "Video", cover: "https://example.com/video-cover.jpg" }
    };

    (getPostData as any).mockReturnValue(mockPostData);

    const result = getPostOGImages(mockMetadata);
    expect(result).toEqual(["https://example.com/video-cover.jpg"]);
  });

  test("should return audio cover URI when no attachments are present", () => {
    const mockMetadata = { __typename: "AudioMetadata" } as any;
    const mockPostData = {
      attachments: [],
      asset: { type: "Audio", cover: "https://example.com/audio-cover.jpg" }
    };

    (getPostData as any).mockReturnValue(mockPostData);

    const result = getPostOGImages(mockMetadata);
    expect(result).toEqual(["https://example.com/audio-cover.jpg"]);
  });

  test("should return attachment URIs for video if present", () => {
    const mockMetadata = { __typename: "VideoMetadata" } as any;
    const mockPostData = {
      attachments: [
        { uri: "https://example.com/video1.jpg" },
        { uri: "https://example.com/video2.jpg" }
      ],
      asset: { type: "Video", cover: "https://example.com/video-cover.jpg" }
    };

    (getPostData as any).mockReturnValue(mockPostData);

    const result = getPostOGImages(mockMetadata);
    expect(result).toEqual([
      "https://example.com/video1.jpg",
      "https://example.com/video2.jpg"
    ]);
  });

  test("should return empty array if no valid data is present", () => {
    const mockMetadata = { __typename: "TextOnlyMetadata" } as any;

    (getPostData as any).mockReturnValue({ attachments: [], asset: {} });

    const result = getPostOGImages(mockMetadata);
    expect(result).toEqual([]);
  });
});
