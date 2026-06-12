"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Flame, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { menuItems } from "@/lib/mock-data";

type MenuItem = (typeof menuItems)[number];

export function MenuCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group cursor-pointer"
    >
      <div className="relative h-52 overflow-hidden bg-brand-warm-gray">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.badge && (
          <Badge className="absolute top-3 left-3 bg-brand-orange text-white border-0 text-xs">
            {item.badge}
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex gap-1">
          {item.isVeg && (
            <span className="bg-brand-green-herb text-white rounded-full p-1">
              <Leaf className="w-3 h-3" />
            </span>
          )}
          {item.isSpicy && (
            <span className="bg-red-500 text-white rounded-full p-1">
              <Flame className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-serif text-lg font-bold text-brand-brown leading-tight">{item.name}</h3>
          <span className="font-sans font-bold text-brand-orange text-lg">৳{item.price}</span>
        </div>
        <p className="font-sans text-sm text-brand-brown-mid mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-brand-brown-mid">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-brand-brown">{item.rating}</span>
            <span>({item.reviews})</span>
          </div>
          <Button
            size="sm"
            className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full text-xs px-4"
          >
            Add to cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
