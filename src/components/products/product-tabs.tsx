"use client";

import { useState } from "react";
import { Star, ShieldCheck, UserCheck, Info } from "lucide-react";
import { ReviewForm } from "./review-form";
import type { ReviewItem } from "@/actions/reviews";
import { Link } from "@/i18n/routing";

interface ProductTabsProps {
  productId: string;
  reviews: ReviewItem[];
  averageRating: number;
  totalReviews: number;
  canReview: boolean;
  canReviewReason: string | null;
  isLoggedIn: boolean;
  specifications: { label: string; value: string }[];
}

export function ProductTabs({
  productId,
  reviews,
  averageRating,
  totalReviews,
  canReview,
  canReviewReason,
  isLoggedIn,
  specifications = [],
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"reviews" | "specs">("reviews");

  return (
    <div className="mt-12 pt-8 border-t border-warm-gray">
      {/* Przełącznik zakładek */}
      <div className="flex border-b border-warm-gray gap-8 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 text-sm sm:text-base font-serif font-bold transition-all relative flex items-center gap-2 ${
            activeTab === "reviews"
              ? "text-forest border-b-2 border-forest"
              : "text-charcoal/50 hover:text-charcoal"
          }`}
        >
          <span>Opinie klientów</span>
          <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-sage/30 text-forest">
            {totalReviews}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`pb-3 text-sm sm:text-base font-serif font-bold transition-all relative flex items-center gap-2 ${
            activeTab === "specs"
              ? "text-forest border-b-2 border-forest"
              : "text-charcoal/50 hover:text-charcoal"
          }`}
        >
          <span>Specyfikacja produktu</span>
          {specifications.length > 0 && (
            <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-sage/30 text-forest">
              {specifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Zakładka 1: Opinie */}
      {activeTab === "reviews" && (
        <div className="space-y-8">
          {/* Podsumowanie ocen i średnia */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-cream/50 border border-warm-gray">
            <div className="flex items-center gap-4">
              <div className="text-center sm:text-left">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-forest">
                  {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-xs text-charcoal/50 block mt-0.5">z 5 gwiazdek</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? "text-amber-500 fill-amber-500"
                          : "text-warm-gray"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-charcoal/70">
                  Łącznie opinii: <strong className="text-forest">{totalReviews}</strong>
                </p>
              </div>
            </div>

            <div className="text-xs text-charcoal/70 flex items-center gap-2 bg-white/70 p-3 rounded-lg border border-warm-gray/60">
              <ShieldCheck className="h-4 w-4 text-forest shrink-0" />
              <span>
                Wszystkie opinie pochodzą od zweryfikowanych klientów, którzy zakupili ten produkt.
              </span>
            </div>
          </div>

          {/* Formularz dodawania opinii (jeśli uprawniony) lub informacja */}
          {canReview ? (
            <ReviewForm productId={productId} />
          ) : (
            <div className="p-4 rounded-xl bg-sage/10 border border-forest/20 text-xs text-charcoal/80 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-forest mt-0.5 shrink-0" />
              <div>
                {!isLoggedIn ? (
                  <span>
                    Chcesz dodać opinię?{" "}
                    <Link href="/konto" className="font-semibold text-forest underline">
                      Zaloguj się na swoje konto
                    </Link>
                    . Opinie mogą dodawać wyłącznie klienci po zakupie tego produktu.
                  </span>
                ) : (
                  <span>{canReviewReason || "Opinie mogą dodawać wyłącznie zweryfikowani klienci po zakupie."}</span>
                )}
              </div>
            </div>
          )}

          {/* Lista wystawionych opinii */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-charcoal/50 space-y-2">
              <p className="text-sm font-medium">Brak opinii dla tego produktu</p>
              <p className="text-xs">Bądź pierwszą osobą, która podzieli się wrażeniami po zakupie!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-xl bg-white border border-warm-gray shadow-2xs space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= rev.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-warm-gray"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-xs text-charcoal">
                        {rev.userName}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-forest bg-sage/20 px-1.5 py-0.5 rounded-full font-medium">
                        <UserCheck className="h-3 w-3" /> Kupujący
                      </span>
                    </div>

                    <span className="text-[11px] text-charcoal/50">
                      {new Date(rev.createdAt).toLocaleDateString("pl-PL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {rev.title && (
                    <h4 className="font-semibold text-sm text-forest">
                      {rev.title}
                    </h4>
                  )}

                  <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Zakładka 2: Specyfikacja produktu (Kafelki) */}
      {activeTab === "specs" && (
        <div>
          {specifications && specifications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specifications.map((spec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white border border-warm-gray/80 shadow-2xs transition-all hover:border-forest/40"
                >
                  <span className="block text-[11px] font-semibold text-charcoal/60 uppercase tracking-wider mb-1">
                    {spec.label}
                  </span>
                  <span className="font-serif text-base font-bold text-forest">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-charcoal/50 space-y-2">
              <p className="text-sm font-medium">Brak dodatkowych szczegółów specyfikacji</p>
              <p className="text-xs">Informacje o materiałach i wykonaniu znajdziesz w opisie powyżej.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
