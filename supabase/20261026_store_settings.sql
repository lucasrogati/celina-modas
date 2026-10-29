CREATE TABLE public.store_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  configured boolean NOT NULL DEFAULT false,
  whatsapp text NOT NULL DEFAULT '' CHECK (whatsapp = '' OR whatsapp ~ '^[0-9]{10,15}$'),
  instagram text NOT NULL DEFAULT '' CHECK (instagram = '' OR (char_length(instagram) <= 300 AND instagram ~ '^https://(www\.)?instagram\.com/[A-Za-z0-9_.]+/?$')),
  email text NOT NULL DEFAULT '' CHECK (char_length(email) <= 254 AND (email = '' OR email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  hours text NOT NULL DEFAULT '' CHECK (char_length(hours) <= 300),
  announcement_enabled boolean NOT NULL DEFAULT true,
  announcement text NOT NULL DEFAULT '' CHECK (char_length(announcement) <= 180),
  hero_image_path text CHECK (hero_image_path ~ '^settings/[A-Za-z0-9_-]+\.(webp|jpg|jpeg|png)$'),
  hero_image_url text NOT NULL DEFAULT '' CHECK (char_length(hero_image_url) <= 2048 AND (hero_image_url = '' OR hero_image_url ~ '^https://')),
  hero_eyebrow text NOT NULL DEFAULT '' CHECK (char_length(hero_eyebrow) <= 70),
  hero_title text NOT NULL DEFAULT '' CHECK (char_length(hero_title) <= 100),
  hero_description text NOT NULL DEFAULT '' CHECK (char_length(hero_description) <= 300),
  hero_button_label text NOT NULL DEFAULT 'Conhecer a coleção' CHECK (char_length(btrim(hero_button_label)) BETWEEN 1 AND 50),
  hero_target text NOT NULL DEFAULT 'all' CHECK (hero_target IN ('all', 'category', 'whatsapp')),
  hero_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT configured OR (whatsapp <> '' AND char_length(btrim(hero_title)) > 0 AND (hero_image_path IS NOT NULL OR hero_image_url <> '')))
);
CREATE FUNCTION public.celina_settings_revision() RETURNS trigger
LANGUAGE plpgsql SET search_path = ''
AS $$ BEGIN
  NEW.id = OLD.id;
  NEW.revision = OLD.revision + 1;
  NEW.updated_at = now();
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.celina_settings_revision() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER store_settings_revision BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION public.celina_settings_revision();
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.store_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT UPDATE (configured, whatsapp, instagram, email, hours, announcement_enabled, announcement, hero_image_path, hero_image_url, hero_eyebrow, hero_title, hero_description, hero_button_label, hero_target, hero_category_id) ON public.store_settings TO authenticated;
CREATE POLICY store_settings_public_read ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY store_settings_admin_update ON public.store_settings FOR UPDATE TO authenticated
USING ((SELECT public.is_catalog_admin())) WITH CHECK ((SELECT public.is_catalog_admin()));
INSERT INTO public.store_settings (id) VALUES (1);
