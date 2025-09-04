import React from "react";
import { Stream } from "@cloudflare/stream-react";


export type CloudflareStreamPlayerProps = {
uid: string; // Cloudflare Stream video UID or signed token
autoplay?: boolean;
muted?: boolean;
loop?: boolean;
controls?: boolean;
poster?: string;
className?: string;
};


/** Keep this wrapper tiny (why: consistent API across app). */
export default function CloudflareStreamPlayer({
uid,
autoplay = false,
muted = true,
loop = true,
controls = true,
poster,
className,
}: CloudflareStreamPlayerProps): JSX.Element {
return (
<div className={className}>
<Stream
src={uid}
controls={controls}
autoplay={autoplay}
muted={muted}
loop={loop}
poster={poster}
responsive
width="100%"
height="100%"
preload="metadata"
/>
</div>
);
}