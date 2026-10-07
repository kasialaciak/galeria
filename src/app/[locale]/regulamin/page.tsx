import { Card, CardContent } from "@/components/ui/card";

export default function RegulaminPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-serif text-3xl font-bold text-forest mb-6">Regulamin Sklepu "Cosmic Loop"</h1>
      
      <Card>
        <CardContent className="p-8 prose prose-sm sm:prose-base max-w-none text-charcoal/80">
          <p className="mb-4">
            <em>Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}</em>
          </p>
          
          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">1. Postanowienia ogólne</h2>
          <p>
            Niniejszy regulamin określa zasady dokonywania zakupów w sklepie internetowym Cosmic Loop.
            Sklep zajmuje się sprzedażą rękodzieła wykonywanego na zamówienie.
          </p>

          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">2. Towary na zamówienie</h2>
          <p>
            Wszystkie produkty prezentowane w sklepie (szydełko, biżuteria z gliny/modeliny, ceramika) 
            są tworzone ręcznie na indywidualne zamówienie Klienta.
          </p>

          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">3. Czas realizacji i dostawa</h2>
          <p>
            Z uwagi na rękodzielniczy charakter, standardowy czas realizacji i przygotowania wysyłki 
            wynosi do 21 dni roboczych. Dokładamy wszelkich starań, aby wysłać zamówienie jak najszybciej.
          </p>

          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">4. Prawo odstąpienia od umowy (Zwroty)</h2>
          <p>
            Zgodnie z polskim prawem autorskim i konsumenckim (art. 38 pkt 3 ustawy o prawach konsumenta), 
            prawo odstąpienia od umowy zawartej poza lokalem przedsiębiorstwa lub na odległość nie przysługuje konsumentowi w odniesieniu do umów, 
            w której przedmiotem świadczenia jest <strong>rzecz nieprefabrykowana, wyprodukowana według specyfikacji konsumenta 
            lub służąca zaspokojeniu jego zindywidualizowanych potrzeb</strong>. W związku z tym zwroty towarów robionych 
            na indywidualne zamówienie nie są możliwe, z wyjątkiem sytuacji, gdy produkt posiada wady ukryte (reklamacja).
          </p>
          
          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">5. Płatności</h2>
          <p>
            Rozliczenia transakcji online przeprowadzane są za pośrednictwem systemu płatności Stripe. 
            Do czasu opłacenia zamówienia pozostaje ono w statusie niepotwierdzonym.
          </p>
          
          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">6. Reklamacje</h2>
          <p>
            Jeżeli zamówiony towar dotarł uszkodzony lub posiada wady, Klient ma prawo złożyć reklamację, wysyłając 
            wiadomość na nasz adres kontaktowy, załączając dowód w postaci zdjęć.
          </p>

          <div className="mt-8 p-4 bg-cream/50 rounded-lg text-sm">
            <p><strong>Uwaga:</strong> Powyższy tekst stanowi jedynie zarys (wzór) regulaminu. Należy go uzupełnić 
            o pełne dane sprzedawcy (NIP, REGON, Adres firmy) i skonsultować pod kątem wymogów prawnych.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
