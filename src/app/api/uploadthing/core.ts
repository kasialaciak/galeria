import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  productImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 6 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id || (session.user as any).role !== "admin") {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
