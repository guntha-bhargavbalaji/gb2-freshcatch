# GB² FreshCatch — Production Setup

## What changed
- Products now come from Supabase PostgreSQL instead of browser localStorage.
- Customers see the same product catalogue on every device.
- Admin uses Supabase email/password authentication.
- Product create/edit/delete is protected by Row Level Security (RLS).
- Admin can upload product images directly from a phone or computer using Supabase Storage.
- Customers see Cart and Checkout as popups instead of permanent sections on the home page.
- Customer orders still go ONLY to WhatsApp; no payment gateway is included.

## 1. Create a Supabase project
Go to https://supabase.com/ and create a project.

## 2. Create the database
Open Supabase -> SQL Editor.
Paste and run `supabase-schema.sql`.

## 3. Create your admin login
Supabase -> Authentication -> Users -> Add user.
Create the admin email and password you want to use.

Copy the new user's UUID.

Back in SQL Editor, run:
insert into public.admin_users(user_id) values ('PASTE_ADMIN_USER_UUID_HERE');

Do not share the UUID/password publicly.

## 4. Connect the website
Open `config.js` and replace:
PASTE_YOUR_SUPABASE_PROJECT_URL
PASTE_YOUR_SUPABASE_ANON_KEY

You can find these in Supabase -> Project Settings -> API.

Use ONLY the `anon` / publishable public key in the website.
NEVER put the `service_role` / secret key in website files.

## 5. Enable product image uploads
Open `storage-migration.sql` in Supabase SQL Editor and run it once. This creates the public `product-images` bucket and admin-only upload/update/delete policies.

## 6. Test
- Open index.html through a web host (GitHub Pages works).
- Products should load from Supabase.
- Open /admin.html.
- Log in with the admin account.
- Add/edit/delete products.
- Open the store from another phone: the same products should appear.

## 7. GitHub Pages
Upload:
index.html
admin.html
style.css
script.js
config.js
logo.jpg
supabase-schema.sql
storage-migration.sql
SETUP.md

GitHub Pages serves the customer site. Supabase supplies the database and authentication.

## Security note
The admin password is handled by Supabase Auth; it is not stored in your HTML/JavaScript.
The RLS policies prevent non-admin users from changing products.

## WhatsApp
Orders go to WhatsApp number 9493033331.
The website uses wa.me/919493033331.
