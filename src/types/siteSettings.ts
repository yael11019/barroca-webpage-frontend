export interface CarouselSlide {
  id: number
  // New API format
  desktop_url?: string
  mobile_url?: string
  blur_placeholder_mobile?: string
  // Legacy field
  image_url?: string
  blur_placeholder: string
  order: number
  link_url: string | null
}

export interface HeroMedia {
  desktop_url: string
  desktop_blur?: string
  mobile_url?: string
  mobile_blur?: string
}

export interface CatalogoMedia {
  desktop_url: string
  desktop_blur?: string
  mobile_url?: string
  mobile_blur?: string
}

export interface SiteMediaResponse {
  // Legacy
  hero_url?: string
  hero_blur?: string
  // New
  hero?: HeroMedia
  carousel: CarouselSlide[]
  catalogos?: Record<string, CatalogoMedia>
}
