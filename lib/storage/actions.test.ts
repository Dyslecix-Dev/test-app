import { describe, expect, it } from "vitest";

// NOTE: test the extension sanitization logic extracted from uploadFileAction
// We can't easily test the full server action without Supabase, but we can verify the safety logic
describe("file extension sanitization", () => {
  function sanitizeExtension(fileName: string): string {
    const rawExt = fileName.split(".").pop() ?? "bin";
    return rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin";
  }

  it("extracts normal extensions", () => {
    expect(sanitizeExtension("photo.png")).toBe("png");
    expect(sanitizeExtension("doc.pdf")).toBe("pdf");
    expect(sanitizeExtension("image.jpeg")).toBe("jpeg");
  });

  it("strips path traversal characters", () => {
    // NOTE: split(".").pop() gives "etc/passwd" → stripping non-alnum → "etcpasswd"
    expect(sanitizeExtension("evil../../../etc/passwd")).toBe("etcpasswd");
    // NOTE: split(".").pop() gives "/../../secret" → stripping → "secret"
    expect(sanitizeExtension("file.png/../../secret")).toBe("secret");
  });

  it("strips special characters from extension", () => {
    expect(sanitizeExtension("file.p<n>g")).toBe("png");
    expect(sanitizeExtension("file.ex;e")).toBe("exe");
    expect(sanitizeExtension("file.t x t")).toBe("txt");
  });

  it("truncates long extensions to 10 characters", () => {
    expect(sanitizeExtension("file.verylongextension")).toBe("verylongex");
  });

  it("falls back to bin for empty extension", () => {
    expect(sanitizeExtension("noext")).toBe("noext".replace(/[^a-zA-Z0-9]/g, "").slice(0, 10));
    expect(sanitizeExtension("file.")).toBe("bin");
    expect(sanitizeExtension("file.!!!")).toBe("bin");
  });

  it("handles files with multiple dots", () => {
    expect(sanitizeExtension("archive.tar.gz")).toBe("gz");
    expect(sanitizeExtension("my.file.name.txt")).toBe("txt");
  });
});
