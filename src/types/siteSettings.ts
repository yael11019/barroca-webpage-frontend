export interface CarouselSlide {
  id: number
  image_url: string
  blur_placeholder: string
  order: number
  link_url: string | null
}

export interface SiteMediaResponse {
  hero_url: string
  hero_blur: string
  carousel: CarouselSlide[]
}
