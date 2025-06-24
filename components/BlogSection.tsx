"use client"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { BlogCard } from "./BlogCard"
import { useMainStore } from "@/stores/mainStore"
import { useEffect } from "react"

export function BlogSection() {
  const { contents } = useMainStore()

 
  const filteredContents = contents.filter(post => post.type !== "PAGE")

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container-section">
        <div className="content-section">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
            <h2 className="text-secondary">BLOG Y NOTICIAS</h2>
            <a
              href="/blog"
              className="text-primary hover:text-primary/90 transition-colors flex items-center gap-2 group"
            >
              Ver todos los post
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredContents.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <BlogCard content={post} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
