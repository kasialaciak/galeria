import { Card, CardContent } from "@/components/ui/card";

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (locale === "en") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-serif text-3xl font-bold text-forest mb-6">"Kasia Łaciak" Privacy Policy</h1>
        
        <Card>
          <CardContent className="p-8 prose prose-sm sm:prose-base max-w-none text-charcoal/80">
            <p className="mb-4">
              <em>Last updated: {new Date().toLocaleDateString("en-US")}</em>
            </p>

            <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">1. Personal Data Administrator</h2>
            <p>
              The administrator of your personal data is the Kasia Łaciak store. We collect data solely for the 
              proper provision of services, order fulfillment, and maintaining the customer account.
            </p>

            <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">2. What data do we process?</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>First and last name</li>
              <li>Residence / delivery address</li>
              <li>Email address</li>
              <li>Payment details (processed by the Stripe operator)</li>
              <li>Order history</li>
            </ul>

            <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">3. Purpose and legal basis of processing</h2>
            <p>
              Data is processed on the basis of necessity to perform the contract (Art. 6 sec. 1 lit. b GDPR), 
              so that we can fulfill and ship your order. 
            </p>

            <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">4. Who do we share data with?</h2>
            <p>
              We transfer your data to external entities only to the extent necessary to provide the service:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stripe - to process a secure payment.</li>
              <li>Courier company / InPost - to send the parcel to the indicated address or parcel locker.</li>
            </ul>

            <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">5. Your rights (GDPR)</h2>
            <p>
              You have the right to access your data, correct it, request its deletion or restriction of processing. 
              You can do this by contacting us by email or managing your data from your store account.
            </p>

            <div className="mt-8 p-4 bg-cream/50 rounded-lg text-sm">
              <p><strong>Note:</strong> The above text is only a draft (template) of the privacy policy. 
              We recommend adapting it to full GDPR requirements and indicating exact company details.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-serif text-3xl font-bold text-forest mb-6">Polityka Prywatności "Kasia Łaciak"</h1>
      
      <Card>
        <CardContent className="p-8 prose prose-sm sm:prose-base max-w-none text-charcoal/80">
          <p className="mb-4">
            <em>Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}</em>
          </p>

          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">1. Administrator danych osobowych</h2>
          <p>
            Administratorem Twoich danych osobowych jest sklep Kasia Łaciak. Zbieramy dane wyłącznie w celu 
            prawidłowej realizacji usług, zamówień oraz prowadzenia konta klienta.
          </p>

          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">2. Jakie dane przetwarzamy?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Imię i nazwisko</li>
            <li>Adres zamieszkania / dostawy</li>
            <li>Adres e-mail</li>
            <li>Dane płatności (przetwarzane przez operatora Stripe)</li>
            <li>Historia zamówień</li>
          </ul>

          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">3. Cel i podstawy prawne przetwarzania</h2>
          <p>
            Dane są przetwarzane na podstawie niezbędności do wykonania umowy (art. 6 ust. 1 lit. b RODO), 
            abyśmy mogli zrealizować i wysłać Twoje zamówienie. 
          </p>

          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">4. Komu udostępniamy dane?</h2>
          <p>
            Twoje dane przekazujemy podmiotom zewnętrznym tylko w niezbędnym zakresie do realizacji usługi:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Stripe - w celu przetworzenia bezpiecznej płatności.</li>
            <li>Firma kurierska / InPost - w celu nadania przesyłki na wskazany adres lub do paczkomatu.</li>
          </ul>

          <h2 className="text-forest font-serif mt-6 mb-3 text-xl font-bold">5. Twoje prawa (RODO)</h2>
          <p>
            Masz prawo dostępu do swoich danych, ich poprawiania, żądania usunięcia lub ograniczenia przetwarzania. 
            Możesz to zrobić kontaktując się z nami mailowo lub zarządzając swoimi danymi z poziomu swojego konta w sklepie.
          </p>

          <div className="mt-8 p-4 bg-cream/50 rounded-lg text-sm">
            <p><strong>Uwaga:</strong> Powyższy tekst stanowi jedynie zarys (wzór) polityki prywatności. 
            Zalecamy dostosowanie go do pełnych wymogów RODO i wskazanie dokładnych danych firmy.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
