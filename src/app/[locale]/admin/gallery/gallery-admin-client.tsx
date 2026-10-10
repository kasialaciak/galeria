"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UploadDropzone } from "@/utils/uploadthing";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { 
  addGalleryCategory, deleteGalleryCategory,
  addGalleryWork, deleteGalleryWork,
  addGalleryCarouselImage, deleteGalleryCarouselImage,
  updateGalleryDescription
} from "@/actions/gallery-actions";

export function GalleryAdminClient({ 
  initialCategories, 
  initialWorks, 
  initialCarousel, 
  initialDescription 
}: any) {
  const [activeTab, setActiveTab] = useState("works");

  const [descriptionPl, setDescriptionPl] = useState(initialDescription?.pl || "");
  const [descriptionEn, setDescriptionEn] = useState(initialDescription?.en || "");
  
  // Category state
  const [catPl, setCatPl] = useState("");
  const [catEn, setCatEn] = useState("");
  const [catSlug, setCatSlug] = useState("");

  // Work state
  const [workTitlePl, setWorkTitlePl] = useState("");
  const [workTitleEn, setWorkTitleEn] = useState("");
  const [workDescPl, setWorkDescPl] = useState("");
  const [workDescEn, setWorkDescEn] = useState("");
  const [workCatId, setWorkCatId] = useState("");
  const [workImage, setWorkImage] = useState("");

  const handleSaveDescription = async () => {
    try {
      await updateGalleryDescription(descriptionPl, descriptionEn);
      toast.success("Zapisano opis galerii");
    } catch (e) {
      toast.error("Błąd zapisu opisu");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!catPl || !catEn || !catSlug) {
      toast.error("Wypełnij wszystkie pola");
      return;
    }
    try {
      await addGalleryCategory({ namePl: catPl, nameEn: catEn, slug: catSlug });
      toast.success("Dodano kategorię");
      setCatPl(""); setCatEn(""); setCatSlug("");
    } catch (e) {
      toast.error("Błąd przy dodawaniu kategorii");
    }
  };

  const handleAddWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!workTitlePl || !workTitleEn || !workCatId || !workImage) {
      toast.error("Wypełnij wymagane pola (zdjęcie, kategoria, tytuły)");
      return;
    }
    try {
      await addGalleryWork({
        categoryId: workCatId,
        titlePl: workTitlePl,
        titleEn: workTitleEn,
        descriptionPl: workDescPl,
        descriptionEn: workDescEn,
        imageUrl: workImage
      });
      toast.success("Dodano pracę");
      setWorkTitlePl(""); setWorkTitleEn(""); setWorkDescPl(""); setWorkDescEn(""); setWorkImage("");
    } catch (e) {
      toast.error("Błąd przy dodawaniu pracy");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-2">
        <Button variant={activeTab === "works" ? "default" : "outline"} onClick={() => setActiveTab("works")}>Prace</Button>
        <Button variant={activeTab === "categories" ? "default" : "outline"} onClick={() => setActiveTab("categories")}>Kategorie</Button>
        <Button variant={activeTab === "carousel" ? "default" : "outline"} onClick={() => setActiveTab("carousel")}>Karuzela i Opis</Button>
      </div>

      {activeTab === "works" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dodaj nową pracę</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddWork} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tytuł (PL)</label>
                    <Input value={workTitlePl} onChange={e => setWorkTitlePl(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tytuł (EN)</label>
                    <Input value={workTitleEn} onChange={e => setWorkTitleEn(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategoria</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={workCatId} 
                      onChange={e => setWorkCatId(e.target.value)}
                    >
                      <option value="">Wybierz kategorię...</option>
                      {initialCategories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.namePl}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Opis (PL)</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={workDescPl} 
                      onChange={e => setWorkDescPl(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Opis (EN)</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={workDescEn} 
                      onChange={e => setWorkDescEn(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zdjęcie</label>
                  {workImage ? (
                    <div className="relative h-40 w-40 rounded-md overflow-hidden border">
                      <Image src={workImage} alt="Preview" fill className="object-cover" />
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2"
                        onClick={() => setWorkImage("")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint="productImageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setWorkImage(res[0].url);
                          toast.success("Zdjęcie przesłane");
                        }
                      }}
                      onUploadError={() => { toast.error("Błąd przesyłania"); }}
                    />
                  )}
                </div>
                <Button type="submit">Dodaj Pracę</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zarządzaj Pracami</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {initialWorks.map((work: any) => (
                  <div key={work.id} className="flex items-center gap-4 border p-4 rounded-md">
                    <div className="relative h-16 w-16 bg-muted rounded-md overflow-hidden shrink-0">
                      <Image src={work.imageUrl} alt={work.titlePl} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{work.titlePl}</p>
                      <p className="text-sm text-muted-foreground">{initialCategories.find((c: any) => c.id === work.categoryId)?.namePl}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={async () => {
                      if(confirm("Na pewno usunąć?")) {
                        await deleteGalleryWork(work.id);
                        toast.success("Usunięto pracę");
                      }
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {initialWorks.length === 0 && <p className="text-muted-foreground text-sm">Brak prac.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dodaj nową kategorię</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="flex items-end gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Nazwa (PL)</label>
                  <Input value={catPl} onChange={e => setCatPl(e.target.value)} />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Nazwa (EN)</label>
                  <Input value={catEn} onChange={e => setCatEn(e.target.value)} />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Slug (bez spacji)</label>
                  <Input value={catSlug} onChange={e => setCatSlug(e.target.value.toLowerCase())} placeholder="np. obrazy" />
                </div>
                <Button type="submit">Dodaj</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kategorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {initialCategories.map((cat: any) => (
                  <div key={cat.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{cat.namePl} / {cat.nameEn}</p>
                      <p className="text-sm text-muted-foreground">slug: {cat.slug}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={async () => {
                      if(confirm("Na pewno usunąć?")) {
                        await deleteGalleryCategory(cat.id);
                        toast.success("Usunięto kategorię");
                      }
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "carousel" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opis pod karuzelą</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Opis galerii (PL)</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={descriptionPl} 
                  onChange={e => setDescriptionPl(e.target.value)} 
                  placeholder="Wpisz krótki opis widoczny na górze galerii..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Opis galerii (EN)</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={descriptionEn} 
                  onChange={e => setDescriptionEn(e.target.value)} 
                  placeholder="Enter a short description..."
                  rows={4}
                />
              </div>
              <Button onClick={handleSaveDescription}>Zapisz Opis</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Karuzela Zdjęć</CardTitle>
              <CardDescription>Dodaj zdjęcia, które będą przewijać się na górze strony.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <UploadDropzone
                  endpoint="productImageUploader"
                  onClientUploadComplete={async (res) => {
                    if (res && res[0]) {
                      await addGalleryCarouselImage(res[0].url);
                      toast.success("Dodano zdjęcie do karuzeli");
                    }
                  }}
                  onUploadError={() => { toast.error("Błąd przesyłania"); }}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {initialCarousel.map((item: any) => (
                  <div key={item.id} className="relative aspect-video rounded-md overflow-hidden border group">
                    <Image src={item.imageUrl} alt="Carousel image" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="icon" onClick={async () => {
                        if(confirm("Na pewno usunąć z karuzeli?")) {
                          await deleteGalleryCarouselImage(item.id);
                          toast.success("Usunięto zdjęcie");
                        }
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
