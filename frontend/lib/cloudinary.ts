/**
 * Cloudinary image optimization utility
 * Transforms any image URL to use Cloudinary's f_auto,q_auto delivery
 */

const CLOUDINARY_BASE = process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL || '';

/**
 * Returns a Cloudinary-optimized URL for an image.
 *
 * - If the URL is already a Cloudinary URL, it injects `f_auto,q_auto`
 *   into the transformation segment (without duplicating it).
 * - If the URL is a relative path or a non-Cloudinary URL, it is
 *   returned as-is so existing local assets continue to work.
 *
 * @param src  The raw image URL stored in the database or component.
 * @returns    The optimised image URL ready for Next.js <Image />.
 */
export function cloudinaryUrl(src: string | null | undefined): string {
    if (!src) return '';

    // Already a Cloudinary URL
    if (src.includes('res.cloudinary.com')) {
        // Avoid double-injecting transformations
        if (src.includes('f_auto') || src.includes('q_auto')) {
            return src;
        }
        // Inject f_auto,q_auto after /upload/
        return src.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    // Relative paths (local public assets) — return unchanged
    if (src.startsWith('/')) return src;

    // Supabase or any other absolute URL — return unchanged
    // (These will still render via <img> or Next.js unoptimized mode)
    return src;
}

/**
 * Returns true if the given URL is hosted on Cloudinary.
 */
export function isCloudinaryUrl(src: string | null | undefined): boolean {
    return typeof src === 'string' && src.includes('res.cloudinary.com');
}
