# Museum hero assets

`museum-poster.jpg` is a generated, fictional museum interior, not a photograph of The Met. Created with the built-in image-generation tool on September 12, 2026. `museum-pan.mp4` is an eight-second, silent H.264 push-in made from that still, rather than independently generated video footage. Both assets are used by the single-file landing page in `index.html`.

The page overlays the original live Met image inside the central case. Met imagery is neither baked into the film nor downloaded/mirrored. The video repeats once (two plays total), then holds the final frame. A pause/replay control and reduced-motion support are included. Artifact placement follows the same cosine zoom used to encode the video.

## Generation prompt

Photorealistic widescreen cinematic empty art museum gallery photographed directly front-on. Symmetrical dark warm stone gallery, restrained brass/glass cases and museum architectural depth at left/right edges. A single freestanding tall glass display case perfectly centered horizontally, front pane parallel to camera, empty dark neutral charcoal back panel inside, low dark pedestal under glass, subtle realistic glass edge reflections. Central case reserved for compositing the daily artifact image. Upper middle has uncluttered dark architectural wall for a white headline. Sophisticated photographic materials, gentle spotlights, realistic non-specific museum; do not represent a real Met interior. No people, no artworks inside the central case, no text, logos, or watermarks.

## Encoding

The source was converted to a 1600 × 900 JPEG. Video: 30 fps, 240 frames, H.264 CRF 23, yuv420p, faststart, no audio. Zoom is `1 + 0.1 * (1 - cos(PI * frame / 239)) / 2`, centered on the source image. The video remains below 1 MB.
