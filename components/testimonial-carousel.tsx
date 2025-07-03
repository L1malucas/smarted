// components/testimonial-carousel.tsx
"use client"
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

import { Testimonial } from "@/types/component-props"

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ana Silva",
    role: "Gerente de RH",
    company: "TechCorp",
    content: "A plataforma revolucionou nosso processo de recrutamento. Conseguimos reduzir o tempo de contratação em 60% e encontrar candidatos muito mais qualificados.",
    avatar: "/avatars/ana.jpg",
    rating: 5
  },
  {
    id: 2,
    name: "Carlos Mendes",
    role: "Diretor de Pessoas",
    company: "InnovateLab",
    content: "A IA da plataforma é impressionante. Ela consegue identificar talentos que tradicionalmente passariam despercebidos no nosso processo manual.",
    avatar: "/avatars/carlos.jpg",
    rating: 5
  },
  {
    id: 3,
    name: "Marina Costa",
    role: "Head de Talentos",
    company: "StartupXYZ",
    content: "Interface intuitiva e resultados excepcionais. Nossa equipe adotou a ferramenta rapidamente e os resultados apareceram na primeira semana.",
    avatar: "/avatars/marina.jpg",
    rating: 5
  }
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="relative">
      {/* Main testimonial card */}
      <div className="bg-slate-800 rounded-2xl p-10 text-white relative overflow-hidden h-[480px] flex flex-col justify-between transition-all duration-500 ease-out shadow-2xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/15 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Rating stars */}
          <div className="flex gap-1 mb-6">
            {[...Array(currentTestimonial.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          
          {/* Testimonial content */}
          <blockquote className="text-xl leading-relaxed mb-8 text-slate-100 flex-1 flex items-center">
            <span>"{currentTestimonial.content}"</span>
          </blockquote>
          
          {/* Author info */}
          <div className="flex items-center gap-5">
            <Avatar className="w-14 h-14 ring-2 ring-slate-600">
              <AvatarImage src={currentTestimonial.avatar} alt={currentTestimonial.name} />
              <AvatarFallback className="bg-slate-700 text-white font-bold text-lg">
                {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-white text-lg">
                {currentTestimonial.name}
              </div>
              <div className="text-slate-300 text-base">
                {currentTestimonial.role} • {currentTestimonial.company}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between mt-8">
        {/* Dots indicator */}
        <div className="flex gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-500 ease-out ${
                index === currentIndex 
                  ? 'bg-blue-600 w-10' 
                  : 'bg-slate-300 hover:bg-slate-400 w-3'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow navigation */}
        <div className="flex gap-3">
          <button
            onClick={goToPrevious}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 ease-out shadow-md hover:shadow-lg"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <button
            onClick={goToNext}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 ease-out shadow-md hover:shadow-lg"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${((currentIndex + 1) / testimonials.length) * 100}%` 
          }}
        />
      </div>
    </div>
  )
}