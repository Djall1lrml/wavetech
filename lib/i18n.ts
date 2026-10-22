import { cookies } from "next/headers";
const d = {
 fr: { shop: "Boutique", track: "Suivi", cart: "Panier", order: "Commander", add: "Ajouter au panier", feat: "Produits vedettes", why: ["Livraison rapide", "58 wilayas"], hero: "Consoles rétro, nouvelle vague", name: "Nom complet", phone: "Téléphone (05/06/07…)", wilaya: "Wilaya", commune: "Commune", address: "Adresse", home: "À domicile", desk: "Stop desk", notes: "Notes", confirm: "Confirmer la commande (paiement à la livraison)", delivery: "Livraison", total: "Total", stock: "En stock", out: "Rupture", search: "Rechercher" },
 ar: { shop: "المتجر", track: "تتبع الطلب", cart: "السلة", order: "اطلب الآن", add: "أضف إلى السلة", feat: "منتجات مميزة", why: ["توصيل سريع", "58 ولاية"], hero: "أجهزة ريترو، موجة جديدة", name: "الاسم الكامل", phone: "الهاتف (05/06/07…)", wilaya: "الولاية", commune: "البلدية", address: "العنوان", home: "إلى المنزل", desk: "مكتب التوصيل", notes: "ملاحظات", confirm: "تأكيد الطلب (الدفع عند الاستلام)", delivery: "التوصيل", total: "المجموع", stock: "متوفر", out: "نفد", search: "بحث" },
};
export const getLang = () => (cookies().get("lang")?.value === "ar" ? "ar" : "fr") as "fr" | "ar";
export const t = () => d[getLang()];
