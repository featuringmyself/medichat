"use client"

import { Card } from "@/components/ui/card"
import { Heart, Users, Stethoscope } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export function ForWhomWeCare() {
  const audiences = [
    {
      icon: Heart,
      title: "Patients",
      description:
        "Get clear explanations of your medications, understand side effects, and know what to expect from your treatment plan.",
      story: '"Finally, I understand what my doctor prescribed and why it matters for my health."',
    },
    {
      icon: Users,
      title: "Caregivers",
      description:
        "Help your loved ones manage their medications safely with easy-to-understand information and reminders.",
      story: '"I can now confidently help my elderly mother with her complex medication routine."',
    },
    {
      icon: Stethoscope,
      title: "Healthcare Professionals",
      description:
        "Enhance patient education and communication with AI-powered explanations that patients can easily understand.",
      story: '"My patients are more engaged and compliant when they truly understand their treatment."',
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)



  const scrollToCard = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 320 + 32 // card width (320px) + gap (32px)
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      if (scrollRef.current) {
        // Clear existing timeout
        clearTimeout(scrollTimeout)

        // Set new timeout to detect when scrolling stops
        scrollTimeout = setTimeout(() => {
          // Update active index when scrolling stops
          if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft
            const cardWidth = 320 + 32 // card width (320px) + gap (32px)
            const index = Math.round(scrollLeft / cardWidth)
            setActiveIndex(Math.min(index, audiences.length - 1))
          }
        }, 150)
      }
    }

    const handleTouchStart = () => {
      if (scrollRef.current) {
        scrollRef.current.style.scrollSnapType = 'none'
      }
    }

    const handleTouchEnd = () => {
      if (scrollRef.current) {
        scrollRef.current.style.scrollSnapType = 'x mandatory'
      }
    }

    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true })
      scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true })
      scrollElement.addEventListener('touchend', handleTouchEnd, { passive: true })

      return () => {
        clearTimeout(scrollTimeout)
        scrollElement.removeEventListener('scroll', handleScroll)
        scrollElement.removeEventListener('touchstart', handleTouchStart)
        scrollElement.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [audiences.length])

  return (
    <section id="for-whom" className="md:py-20 py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl text-slate-900 mb-4">For Whom We Care</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            MediChat serves everyone in the healthcare journey, making medical information accessible to all
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 md:grid md:grid-cols-3 md:overflow-visible pb-4 snap-x snap-mandatory md:snap-none overscroll-x-contain [&::-webkit-scrollbar]:hidden"
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {audiences.map((audience, index) => {
            const Icon = audience.icon
            return (
              <Card
                key={index}
                className="p-8 text-center hover:shadow-lg transition-all duration-300 flex-shrink-0 w-80 md:w-auto snap-start snap-always"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto md:mb-6 mb-1">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-slate-900 md:mb-4 mb-0">{audience.title}</h3>
                <p className="text-slate-600 md:mb-6 mb-0 leading-relaxed">{audience.description}</p>
                <blockquote className="text-primary italic font-medium">{audience.story}</blockquote>
              </Card>
            )
          })}
        </div>

        {/* Pagination dots - only visible on mobile */}
        <div className="flex justify-center mt-6 md:hidden">
          <div className="flex space-x-2">
            {audiences.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${activeIndex === index ? 'bg-primary' : 'bg-slate-300'
                  }`}
                aria-label={`Go to ${audiences[index].title} card`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
