"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChefHat, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { recipes } from "@/lib/mock-data";

export function RecipesSection() {
  return (
    <section className="py-24 bg-brand-warm-gray/50">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Recipes"
          title="Cook it yourself."
          subtitle="Classic CTG recipes broken down so you can cook them at home."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recipes.map((recipe, i) => (
            <motion.article
              key={recipe.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="relative h-56 overflow-hidden bg-brand-warm-gray">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-brand-brown/80 text-white border-0 backdrop-blur-sm">
                  {recipe.difficulty}
                </Badge>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-brand-brown mb-2">{recipe.title}</h3>
                <p className="font-sans text-sm text-brand-brown-mid mb-4 line-clamp-2">{recipe.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-brand-brown-mid mb-5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />{recipe.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />{recipe.servings} servings
                  </span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5" />{recipe.category}
                  </span>
                </div>
                <Link href={`/recipes/${recipe.slug}`}>
                  <Button
                    variant="outline"
                    className="w-full border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white rounded-full transition-all"
                  >
                    View Recipe →
                  </Button>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
