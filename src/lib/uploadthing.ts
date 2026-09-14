import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "../../server";

export const { uploadFiles } = generateReactHelpers<OurFileRouter>({
  url: "/api/uploadthing",
});
