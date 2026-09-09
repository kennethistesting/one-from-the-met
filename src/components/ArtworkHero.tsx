import { useState } from 'react';

export function ArtworkHero({ src, title, thumbnail = false }: { src: string; title: string; thumbnail?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={thumbnail ? 'artwork-frame thumbnail' : 'artwork-frame hero'}>
    {!src || failed ? <div className="image-unavailable" role="img" aria-label={`Image unavailable for ${title}`}>
      <span aria-hidden="true">◻</span><p>Image unavailable</p>{!thumbnail && <p>You can still explore the object’s details below.</p>}
    </div> : <img src={src} alt={title} loading={thumbnail ? 'lazy' : 'eager'} decoding="async" onError={() => setFailed(true)} />}
  </div>;
}
