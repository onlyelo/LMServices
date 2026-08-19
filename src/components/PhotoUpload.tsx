import { useEffect, useRef, useState } from 'react'

/**
 * Sélection de photos, avec miniatures et suppression individuelle.
 *
 * Les limites sont vérifiées ici avant tout envoi : sans ce contrôle, un
 * client qui choisit dix photos de vacances attend la fin d'un téléversement
 * de plusieurs dizaines de Mo pour lire un message d'erreur. Le serveur
 * applique les mêmes plafonds, ce contrôle-ci est du confort, pas de la
 * sécurité.
 */

export const MAX_PHOTOS = 5
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024
export const MAX_TOTAL_BYTES = 15 * 1024 * 1024

/** Fichier accompagné de son aperçu, pour pouvoir révoquer l'URL ensuite. */
type Preview = { file: File; url: string; id: string }

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} Mo`
    : `${Math.round(bytes / 1024)} Ko`
}

export default function PhotoUpload({
  files,
  onChange,
}: {
  files: File[]
  onChange: (next: File[]) => void
}) {
  const [previews, setPreviews] = useState<Preview[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Un aperçu par fichier, révoqué dès que la liste change : sans révocation,
  // chaque sélection laisserait un blob en mémoire jusqu'au rechargement.
  useEffect(() => {
    const next = files.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      // Deux fichiers peuvent porter le même nom (IMG_0001.jpg) : la clé
      // combine nom, taille et position pour rester unique.
      id: `${index}-${file.name}-${file.size}`,
    }))
    setPreviews(next)

    return () => {
      for (const p of next) URL.revokeObjectURL(p.url)
    }
  }, [files])

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0)

  const handleSelect = (selected: File[]) => {
    setError(null)

    const images = selected.filter((f) => f.type.startsWith('image/'))
    if (images.length < selected.length) {
      setError('Seules les images sont acceptées.')
    }

    const tooBig = images.find((f) => f.size > MAX_PHOTO_BYTES)
    if (tooBig) {
      setError(
        `« ${tooBig.name} » pèse ${formatSize(tooBig.size)} — 4 Mo maximum par photo.`,
      )
      return
    }

    const merged = [...files]
    for (const file of images) {
      // Évite d'ajouter deux fois le même fichier si le client resélectionne.
      const duplicate = merged.some((f) => f.name === file.name && f.size === file.size)
      if (!duplicate) merged.push(file)
    }

    if (merged.length > MAX_PHOTOS) {
      setError(`${MAX_PHOTOS} photos maximum — retirez-en avant d’en ajouter d’autres.`)
      return
    }

    const total = merged.reduce((sum, f) => sum + f.size, 0)
    if (total > MAX_TOTAL_BYTES) {
      setError(`Total de ${formatSize(total)} — 15 Mo maximum pour l’ensemble des photos.`)
      return
    }

    onChange(merged)
  }

  const remove = (id: string) => {
    setError(null)
    onChange(previews.filter((p) => p.id !== id).map((p) => p.file))
    // Permet de resélectionner immédiatement le fichier qu'on vient de retirer.
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        id="photos"
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          handleSelect(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
        className="field file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gold/15 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-gold"
      />

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {previews.length > 0 && (
        <>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((p) => (
              <li key={p.id} className="group relative">
                <img
                  src={p.url}
                  alt={p.file.name}
                  className="aspect-square w-full rounded-lg border border-ink-line object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Retirer ${p.file.name}`}
                  className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-ink-line bg-ink text-cream transition hover:border-red-400/60 hover:text-red-400"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      d="M6 6l8 8M14 6l-8 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <span className="mt-1 block truncate text-[10px] text-cream-dim">
                  {formatSize(p.file.size)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-xs text-cream-dim">
            {previews.length} / {MAX_PHOTOS} photos · {formatSize(totalBytes)} sur 15 Mo
          </p>
        </>
      )}

      <p className="mt-2 text-xs leading-relaxed text-cream-dim">
        Quelques photos accélèrent nettement le devis. {MAX_PHOTOS} maximum, 4 Mo par photo.
      </p>
    </div>
  )
}
