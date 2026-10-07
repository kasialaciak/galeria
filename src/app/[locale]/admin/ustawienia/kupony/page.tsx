import { getAdminCoupons } from "@/actions/admin-coupons";
import { CreateCouponForm } from "./create-coupon-form";
import { CouponList } from "./coupon-list";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-forest">Kupony Rabatowe</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Zarządzaj zniżkami procentowymi i kwotowymi dla swoich klientów.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <CreateCouponForm />
        </div>
        <div className="md:col-span-2">
          <CouponList initialCoupons={coupons} />
        </div>
      </div>
    </div>
  );
}
