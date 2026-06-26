
CREATE POLICY "Anyone can upload comprovantes"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'comprovantes');
