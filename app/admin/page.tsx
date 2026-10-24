import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { admin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function guard() {
  const c = cookies();
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => c.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data } = await admin().from("admins").select("email").eq("email", user.email!).maybeSingle();
  if (!data) redirect("/admin/login");
}

async function setStatus(fd: FormData) {
  "use server";
  await guard();
  const id = fd.get("id");
  const status = fd.get("status");
  const allowed = ["new", "confirmed", "shipped", "delivered", "returned", "cancelled"];
  if (typeof id !== "string" || !id || typeof status !== "string" || !allowed.includes(status)) throw new Error("Invalid order status");
  const { error } = await admin().from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(`Could not update order: ${error.message}`);
  revalidatePath("/admin");
}

async function setPrice(fd: FormData) {
  "use server";
  await guard();
  const id = Number(fd.get("id"));
  const homePrice = Number(fd.get("home"));
  const deskPrice = Number(fd.get("desk"));
  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(homePrice) || homePrice < 0 || !Number.isInteger(deskPrice) || deskPrice < 0) {
    throw new Error("Invalid delivery prices");
  }
  const { error } = await admin().from("wilayas").update({ home_price: homePrice, desk_price: deskPrice }).eq("id", id);
  if (error) throw new Error(`Could not update delivery prices: ${error.message}`);
  revalidatePath("/admin");
}

async function addProduct(fd: FormData) {
  "use server";
  await guard();
  const db = admin();
  const name = String(fd.get("name") || "").trim();
  const inputSlug = String(fd.get("slug") || "").trim();
  const price = Number(fd.get("price"));
  const oldPriceValue = String(fd.get("old_price") || "").trim();
  const oldPrice = oldPriceValue ? Number(oldPriceValue) : null;
  const stock = Number(fd.get("stock"));
  const categoryId = Number(fd.get("category_id"));
  const specsText = String(fd.get("specs") || "").trim();
  if (!name || !Number.isInteger(price) || price < 0 || (oldPrice !== null && (!Number.isInteger(oldPrice) || oldPrice < 0)) ||
    !Number.isInteger(stock) || stock < 0 || !Number.isInteger(categoryId) || categoryId < 1) {
    throw new Error("Invalid product details");
  }
  let specs: Record<string, unknown> = {};
  if (specsText) {
    try {
      const parsed: unknown = JSON.parse(specsText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Product specs must be a JSON object");
      specs = parsed as Record<string, unknown>;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Invalid product specs JSON");
    }
  }
  const slugBase = (inputSlug || name).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slug = `${slugBase || "product"}-${Date.now().toString(36)}`;
  const { data: product, error } = await db.from("products").insert({
    name,
    slug,
    description: String(fd.get("description") || "").trim() || null,
    price,
    old_price: oldPrice,
    brand: String(fd.get("brand") || "").trim() || null,
    category_id: categoryId,
    stock,
    featured: fd.get("featured") === "on",
    specs,
  }).select("id").single();
  if (error) throw new Error(`Could not add product: ${error.message}`);

  const image = fd.get("image");
  if (image instanceof File && image.size > 0) {
    const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${product.id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await db.storage.from("products").upload(path, image);
    if (uploadError) throw new Error(`Product was added but image upload failed: ${uploadError.message}`);
    const url = db.storage.from("products").getPublicUrl(path).data.publicUrl;
    const { error: imageError } = await db.from("product_images").insert({ product_id: product.id, url });
    if (imageError) throw new Error(`Product was added but image record failed: ${imageError.message}`);
  }
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
}

async function delProduct(fd: FormData) {
  "use server";
  await guard();
  const id = fd.get("id");
  if (typeof id !== "string" || !id) throw new Error("Invalid product id");
  const { error } = await admin().from("products").delete().eq("id", id);
  if (error) throw new Error(`Could not delete product: ${error.message}`);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/shop");
}

async function setStock(fd: FormData) {
  "use server";
  await guard();
  const id = fd.get("id");
  const stock = Number(fd.get("stock"));
  if (typeof id !== "string" || !id || !Number.isInteger(stock) || stock < 0) throw new Error("Invalid product stock");
  const { error } = await admin().from("products").update({ stock }).eq("id", id);
  if (error) throw new Error(`Could not update product stock: ${error.message}`);
  revalidatePath("/admin");
}

async function setProductPrice(fd: FormData) {
  "use server";
  await guard();
  const id = fd.get("id");
  const price = Number(fd.get("price"));
  if (typeof id !== "string" || !id || !Number.isInteger(price) || price < 0) throw new Error("Invalid product price");
  const { error } = await admin().from("products").update({ price }).eq("id", id);
  if (error) throw new Error(`Could not update product price: ${error.message}`);
  revalidatePath("/admin");
}

export default async function Admin() {
  await guard();
  const db = admin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [{ data: orders }, { data: wilayas }, { data: products }, { data: categories }] = await Promise.all([
    db.from("orders").select("*,wilayas(id,name),order_items(*)").order("created_at", { ascending: false }).limit(100),
    db.from("wilayas").select("*").order("id"),
    db.from("products").select("*,categories(id,name_fr,name_ar),product_images(*)").order("created_at", { ascending: false }),
    db.from("categories").select("id,name_fr,name_ar").order("id"),
  ]);
  const todayOrders = orders?.filter(order => new Date(order.created_at) >= today) || [];
  const deliveredRevenue = orders?.filter(order => order.status === "delivered").reduce((sum, order) => sum + order.total, 0) || 0;
  const inputClass = "inp min-w-0";
  const tableClass = "w-full min-w-max border-collapse text-left text-xs";
  const thClass = "border-b border-slate-200 bg-slate-50 px-3 py-3 font-semibold text-slate-700";
  const tdClass = "border-b border-slate-100 px-3 py-3 align-top";

  return (
    <div className="space-y-10 text-sm">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <p className="rounded-lg border border-slate-200 bg-card p-4"><b>Today's orders:</b> {todayOrders.length}</p>
        <p className="rounded-lg border border-slate-200 bg-card p-4"><b>Delivered revenue:</b> {deliveredRevenue} DA</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Orders ({orders?.length || 0})</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className={tableClass}>
            <thead><tr>{["Code / ID", "Created at", "Customer", "Phone", "Wilaya", "Commune", "Address", "Delivery", "Items", "Subtotal", "Fees", "Total", "Notes", "Status"].map(label => <th key={label} className={thClass}>{label}</th>)}</tr></thead>
            <tbody>{orders?.map(order => <tr key={order.id} className="hover:bg-blue-50/40">
              <td className={tdClass}><b>{order.code}</b><details className="mt-1"><summary className="cursor-pointer text-blue-700">ID complet</summary><span className="break-all">{order.id}</span></details></td>
              <td className={tdClass}>{new Date(order.created_at).toLocaleString("fr-DZ")}</td>
              <td className={tdClass}>{order.name}</td>
              <td className={tdClass}>{order.phone}</td>
              <td className={tdClass}>{order.wilayas?.id} · {order.wilayas?.name}</td>
              <td className={tdClass}>{order.commune}</td>
              <td className={`${tdClass} max-w-52 whitespace-normal`}>{order.address || "—"}</td>
              <td className={tdClass}>{order.delivery_type === "home" ? "Home delivery" : "Pickup desk"}</td>
              <td className={tdClass}><ul className="space-y-1">{order.order_items?.map((item: any) => <li key={item.id}>{item.name} × {item.qty} · {item.price} DA</li>)}</ul></td>
              <td className={tdClass}>{order.subtotal} DA</td>
              <td className={tdClass}>{order.delivery_price} DA</td>
              <td className={`${tdClass} font-semibold`}>{order.total} DA</td>
              <td className={`${tdClass} max-w-48 whitespace-normal`}>{order.notes?.trim() || "—"}</td>
              <td className={tdClass}><form action={setStatus} className="flex min-w-40 flex-col gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} className={inputClass}>{["new", "confirmed", "shipped", "delivered", "returned", "cancelled"].map(status => <option key={status}>{status}</option>)}</select>
                <button className="btn !py-2">Save</button>
              </form></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Products ({products?.length || 0})</h2>
        <div className="mb-5 overflow-x-auto rounded-lg border border-slate-200">
          <table className={tableClass}>
            <thead><tr>{["Image", "ID", "Name", "Slug", "Description", "Price", "Old price", "Brand", "Category", "Stock", "Featured", "Specs", "Created at", "Actions"].map(label => <th key={label} className={thClass}>{label}</th>)}</tr></thead>
            <tbody>{products?.map(product => <tr key={product.id} className="hover:bg-blue-50/40">
              <td className={tdClass}>{product.product_images?.map((image: any) => <a key={image.id} href={image.url} target="_blank" rel="noreferrer"><img src={image.url} alt={product.name} className="mb-1 h-12 w-12 rounded object-cover" /></a>) || "—"}</td>
              <td className={`${tdClass} max-w-32 break-all`}>{product.id}</td>
              <td className={tdClass}>{product.name}</td>
              <td className={tdClass}>{product.slug}</td>
              <td className={`${tdClass} max-w-56 whitespace-normal`}>{product.description || "—"}</td>
              <td className={tdClass}>{product.price} DA</td>
              <td className={tdClass}>{product.old_price ?? "—"}{product.old_price ? " DA" : ""}</td>
              <td className={tdClass}>{product.brand || "—"}</td>
              <td className={tdClass}>{product.categories?.name_fr || product.category_id || "—"}</td>
              <td className={tdClass}>{product.stock}</td>
              <td className={tdClass}>{product.featured ? "Yes" : "No"}</td>
              <td className={`${tdClass} max-w-56 whitespace-normal`}><pre className="whitespace-pre-wrap">{JSON.stringify(product.specs || {}, null, 2)}</pre></td>
              <td className={tdClass}>{new Date(product.created_at).toLocaleDateString("fr-DZ")}</td>
              <td className={tdClass}><div className="flex min-w-44 flex-col gap-2">
                <form action={setStock} className="flex items-center gap-2"><input type="hidden" name="id" value={product.id} /><input aria-label={`Stock de ${product.name}`} name="stock" type="number" min="0" step="1" defaultValue={product.stock} className="inp !w-20" /><button className="btn !py-2">Stock</button></form>
                <form action={setProductPrice} className="flex items-center gap-2"><input type="hidden" name="id" value={product.id} /><input aria-label={`Prix de ${product.name}`} name="price" type="number" min="0" step="1" defaultValue={product.price} className="inp !w-24" /><button className="btn !py-2">Prix</button></form>
                <form action={delProduct}><input type="hidden" name="id" value={product.id} /><button className="text-left text-red-600 hover:underline">Delete</button></form>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>
        <details className="rounded-lg border border-slate-200 bg-card p-4" open>
          <summary className="cursor-pointer font-semibold text-slate-900">Add product</summary>
          <form action={addProduct} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1"><span>Name *</span><input name="name" className={inputClass} required /></label>
            <label className="space-y-1"><span>Slug (optional, auto-adjusted)</span><input name="slug" className={inputClass} placeholder="console-retro" /></label>
            <label className="space-y-1"><span>Price (DA) *</span><input name="price" type="number" min="0" step="1" className={inputClass} required /></label>
            <label className="space-y-1"><span>Old price (DA)</span><input name="old_price" type="number" min="0" step="1" className={inputClass} /></label>
            <label className="space-y-1"><span>Brand</span><input name="brand" className={inputClass} /></label>
            <label className="space-y-1"><span>Category *</span><select name="category_id" className={inputClass} required defaultValue=""><option value="" disabled>Select a category</option>{categories?.map(category => <option key={category.id} value={category.id}>{category.name_fr}{category.name_ar ? ` / ${category.name_ar}` : ""}</option>)}</select></label>
            <label className="space-y-1"><span>Stock *</span><input name="stock" type="number" min="0" step="1" defaultValue="0" className={inputClass} required /></label>
            <label className="flex items-center gap-2 self-end rounded-lg border border-slate-200 bg-white p-3"><input name="featured" type="checkbox" />Featured product</label>
            <label className="space-y-1 sm:col-span-2 lg:col-span-3"><span>Description</span><textarea name="description" rows={3} className={inputClass} /></label>
            <label className="space-y-1 sm:col-span-2 lg:col-span-3"><span>Features (JSON object)</span><textarea name="specs" rows={4} className={inputClass} placeholder={'{"Screen":"3 inches","Battery":"3000 mAh"}'} /></label>
            <label className="space-y-1 sm:col-span-2 lg:col-span-3"><span>Product image</span><input name="image" type="file" accept="image/*" className={inputClass} /></label>
            <button className="btn sm:col-span-2 lg:col-span-3">Add product</button>
          </form>
        </details>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Wilayas and delivery fees ({wilayas?.length || 0})</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead><tr>{["ID", "Wilaya", "Rates and action"].map(label => <th key={label} className={thClass}>{label}</th>)}</tr></thead>
            <tbody>{wilayas?.map(wilaya => <tr key={wilaya.id}>
              <td className={tdClass}>{wilaya.id}</td>
              <td className={tdClass}>{wilaya.name}</td>
              <td className={tdClass}><form action={setPrice} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={wilaya.id} />
                <label className="flex items-center gap-2">Home<input aria-label={`Home delivery ${wilaya.name} in DA`} name="home" type="number" min="0" defaultValue={wilaya.home_price} className="inp !w-24" /></label>
                <label className="flex items-center gap-2">Pickup desk<input aria-label={`Pickup desk delivery ${wilaya.name} in DA`} name="desk" type="number" min="0" defaultValue={wilaya.desk_price} className="inp !w-24" /></label>
                <button className="btn !py-2">Save</button>
              </form></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
