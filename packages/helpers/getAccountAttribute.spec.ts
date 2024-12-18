import type { MetadataAttribute } from "@hey/lens";
import { MetadataAttributeType } from "@hey/lens";
import { describe, expect, test } from "vitest";
import getAccountAttribute from "./getAccountAttribute";

describe("getAccountAttribute", () => {
  test("should return the attribute value from a trait if key is valid", () => {
    const attributes: MetadataAttribute[] = [
      { key: "x", type: MetadataAttributeType.String, value: "@myx" },
      {
        key: "location",
        type: MetadataAttributeType.String,
        value: "New York"
      },
      {
        key: "website",
        type: MetadataAttributeType.String,
        value: "https://www.example.com"
      }
    ];
    expect(getAccountAttribute("location", attributes)).toEqual("New York");
  });

  test("should return an empty string when attributes are undefined", () => {
    const attributes = undefined;
    expect(getAccountAttribute("location", attributes)).toEqual("");
  });

  test("should return an empty string if the key is not found", () => {
    const attributes: MetadataAttribute[] = [
      {
        key: "website",
        type: MetadataAttributeType.String,
        value: "https://www.example.com"
      }
    ];
    expect(getAccountAttribute("location", attributes)).toEqual("");
  });

  test("should return an empty string if the value for the key is empty", () => {
    const attributes: MetadataAttribute[] = [
      { key: "location", type: MetadataAttributeType.String, value: "" }
    ];
    expect(getAccountAttribute("location", attributes)).toEqual("");
  });

  test("should return an empty string when attributes array is empty", () => {
    const attributes: MetadataAttribute[] = [];
    expect(getAccountAttribute("location", attributes)).toEqual("");
  });

  test("should return an empty string if key is valid but value is null", () => {
    const attributes: MetadataAttribute[] = [
      {
        key: "location",
        type: MetadataAttributeType.String,
        value: null as any
      }
    ];
    expect(getAccountAttribute("location", attributes)).toEqual("");
  });
});
