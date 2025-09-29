# Palettes (Unilin & DecoLegno)

Deze app leest de kleuren live uit CSV-bestanden onder `public/palettes/`.
- **Vervang** `unilin.csv` en `decolegno.csv` met je volledige lijsten.
- Formaat: `code,name,hex,textureUrl`
- (Optioneel) plaats bijpassende textures onder `public/textures/<brand>/<CODE>.jpg`.

Na wijzigen **hoef je niets te builden** tijdens ontwikkeling: herlaad de pagina.
Voor iOS/Android (offline bundel) bouw je opnieuw met `pnpm export` en `cap copy`.


> Let op: De meegeleverde v7 CSV’s zijn **plaatsvervangers** met realistische codes/kleuren, maar niet de officiële catalogi. Vervang ze met de officiële lijsten van Unilin/DecoLegno als je die hebt (of stuur ze aan mij voor verwerking).