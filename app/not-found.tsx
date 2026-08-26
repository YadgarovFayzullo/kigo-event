
import { LinkButton } from "@/components/app/link-button"

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center gap-3 px-4 text-center">
      <div className="grid gap-3">
        <h1 className="font-heading text-2xl font-semibold">Sahifa topilmadi</h1>
        <p className="text-sm text-muted-foreground">
          Yozuv oʻchirilgan boʻlishi mumkin yoki havola notoʻgʻri.
        </p>
        <div className="flex justify-center">
          <LinkButton  href="/tournaments">Turnirlarga</LinkButton>
        </div>
      </div>
    </main>
  )
}
