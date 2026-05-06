import { NextResponse } from "next/server";

/**
 * ⚠️ DEPRECATED — Cette route est obsolète depuis la migration vers Cloudflare R2.
 * Utilisez POST /api/presign pour obtenir une presigned URL d'upload direct vers R2.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Cette route n'est plus disponible. Utilisez POST /api/presign pour obtenir une URL d'upload R2.",
      migrate_to: "/api/presign",
    },
    { status: 410 },
  );
}
