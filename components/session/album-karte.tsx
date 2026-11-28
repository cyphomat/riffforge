import Link from "next/link"
import { AlbumCover } from "@/components/session/album-cover"
import { coverPixel, type Album } from "@/lib/session/album"

/**
 * Die Platte des laufenden Jahres am Merch-Stand, gleich unter dem Rang: was
 * auf dem Handy gesehen werden soll, gehört nach links oben.
 */
export function AlbumKarte({ album }: { album: Album }) {
  return (
    <>
      <h2 className="tape">Jahresalbum</h2>
      <section className="card plain">
        <div className="flex items-center gap-4">
          <AlbumCover pixel={coverPixel(album)} klein />
          <div className="min-w-0">
            <p className="display text-[20px] leading-tight text-fg">{album.titel}</p>
            <p className="mt-1 text-[13px] text-muted">
              {album.format} · {album.tracks.length} {album.tracks.length === 1 ? "Track" : "Tracks"}
              {!album.erschienen && " · noch im Studio"}
            </p>
          </div>
        </div>
        <Link href="/album" className="btn btn-ghost btn-small mt-3 w-full">
          Zur Platte ›
        </Link>
      </section>
    </>
  )
}
