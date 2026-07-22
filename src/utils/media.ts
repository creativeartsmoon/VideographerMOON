/**
 * Media & Video URL Utilities
 * Handles Cloudinary video optimization and automated thumbnail extraction.
 */

/**
 * Optimizes video URLs for smooth playback.
 * For Cloudinary URLs, injects 'f_auto,q_auto' transformations to ensure optimal encoding,
 * format selection (WebM/MP4), and adaptive bitrate streaming without lagging.
 */
export function optimizeVideoUrl(videoUrl: string): string {
  if (!videoUrl || typeof videoUrl !== 'string') return '';
  const trimmed = videoUrl.trim();

  // Cloudinary video URL optimization
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/video/upload/')) {
    // If already contains q_auto or f_auto, return as is
    if (trimmed.includes('q_auto') || trimmed.includes('f_auto') || trimmed.includes('vc_auto')) {
      return trimmed;
    }
    // Inject f_auto,q_auto right after /video/upload/
    return trimmed.replace('/video/upload/', '/video/upload/f_auto,q_auto/');
  }

  return trimmed;
}

/**
 * Derives an image thumbnail URL from a video URL if no explicit thumbnail is uploaded.
 * Supports Cloudinary video frame extraction, YouTube, and Vimeo thumbnails.
 */
export function getAutoThumbnailUrl(thumbnailUrl?: string, videoUrl?: string): string {
  // If a custom thumbnail URL is already provided, use it
  if (thumbnailUrl && thumbnailUrl.trim() !== '') {
    return thumbnailUrl.trim();
  }

  if (!videoUrl || typeof videoUrl !== 'string') {
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
  }

  const trimmedVideo = videoUrl.trim();

  // 1. Cloudinary Video Thumbnail Extraction
  if (trimmedVideo.includes('res.cloudinary.com') && trimmedVideo.includes('/video/upload/')) {
    // Replace /video/upload/ or /video/upload/[transforms]/ with /video/upload/f_jpg,q_auto,w_1000,so_1/
    let imgUrl = trimmedVideo.replace(
      /\/video\/upload\/(?:[^\/]+\/)?/,
      '/video/upload/f_jpg,q_auto,w_1000,so_1/'
    );
    // Replace video extension with .jpg
    imgUrl = imgUrl.replace(/\.(mp4|mov|webm|m4v|ogv|m3u8|avi|mkv)(?=[?#]|$)/i, '.jpg');
    if (!imgUrl.match(/\.(jpg|jpeg|png|webp)(?=[?#]|$)/i)) {
      const parts = imgUrl.split('?');
      imgUrl = parts[0] + '.jpg' + (parts[1] ? '?' + parts[1] : '');
    }
    return imgUrl;
  }

  // 2. YouTube Thumbnail Extraction
  const ytMatch = trimmedVideo.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  // 3. Vimeo Thumbnail Extraction (via vumbnail CDN)
  const vimeoMatch = trimmedVideo.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
  }

  // Fallback default poster image
  return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
}
