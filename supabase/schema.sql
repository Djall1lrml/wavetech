create table categories(id serial primary key,slug text unique not null,name_fr text not null,name_ar text);
create table products(id uuid primary key default gen_random_uuid(),slug text unique not null,name text not null,description text,price int not null,old_price int,brand text,category_id int references categories(id),stock int default 0,featured bool default false,specs jsonb default '{}',created_at timestamptz default now());
create table product_images(id serial primary key,product_id uuid references products(id) on delete cascade,url text not null,position int default 0);
create table variants(id serial primary key,product_id uuid references products(id) on delete cascade,name text not null,stock int default 0);
create table wilayas(id int primary key,name text not null,home_price int not null default 700,desk_price int not null default 450);
create table orders(id uuid primary key default gen_random_uuid(),code text unique not null,name text,phone text,wilaya_id int references wilayas(id),commune text,address text,delivery_type text check(delivery_type in('home','desk')),delivery_price int,subtotal int,total int,notes text,status text default 'new' check(status in('new','confirmed','shipped','delivered','returned','cancelled')),created_at timestamptz default now());
create table order_items(id serial primary key,order_id uuid references orders(id) on delete cascade,product_id uuid,name text,price int,qty int);
create table admins(email text primary key);
alter table categories enable row level security;alter table products enable row level security;alter table product_images enable row level security;alter table variants enable row level security;alter table wilayas enable row level security;alter table orders enable row level security;alter table order_items enable row level security;alter table admins enable row level security;
create policy pub_r on categories for select using(true);create policy pub_r on products for select using(true);create policy pub_r on product_images for select using(true);create policy pub_r on variants for select using(true);create policy pub_r on wilayas for select using(true);
-- orders/admins: no public policies; accessed only via service role on the server.
insert into storage.buckets(id,name,public) values('products','products',true) on conflict do nothing;
insert into categories(slug,name_fr,name_ar) values('consoles','Consoles','أجهزة'),('accessories','Accessoires','ملحقات');
insert into wilayas(id,name) select i,n from unnest(array['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M''Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El M''Ghair','El Meniaa']) with ordinality as t(n,i);
update wilayas set home_price=1200,desk_price=800 where id in(1,8,11,32,33,37,50,51,52,53,54,55,56,57,58);
update wilayas set home_price=500,desk_price=350 where id in(16,9,35,42);
-- Add yourself as admin (also create the user in Auth > Users):
-- insert into admins values('you@email.com');
