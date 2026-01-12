import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API_BASE = "https://api.quran.com/api/v4";
const TRANSLATION_ID = 85;

type QuranChapter = {
  chapter: {
    id: number;
    name_simple: string;
    name_arabic: string;
  };
};

type VerseText = {
  id: number;
  verse_key: string;
  text_uthmani: string;
};

type VerseWord = {
  id: number;
  position: number;
  text: string;
  audio_url: string | null;
  translation?: { text?: string | null };
  transliteration?: { text?: string | null };
};

type VerseWordsResponse = {
  verses: Array<{
    id: number;
    verse_number: number;
    verse_key: string;
    words: VerseWord[];
  }>;
};

type TranslationResponse = {
  translations: Array<{
    text: string;
  }>;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return (await res.json()) as T;
}

async function seedSurah(surahId: number) {
  const chapter = await fetchJson<QuranChapter>(`${API_BASE}/chapters/${surahId}`);
  const versesText = await fetchJson<{ verses: VerseText[] }>(
    `${API_BASE}/quran/verses/uthmani?chapter_number=${surahId}`
  );
  const versesWords = await fetchJson<VerseWordsResponse>(
    `${API_BASE}/verses/by_chapter/${surahId}?words=true&language=en`
  );
  const translations = await fetchJson<TranslationResponse>(
    `${API_BASE}/quran/translations/${TRANSLATION_ID}?chapter_number=${surahId}`
  );

  await prisma.surah.upsert({
    where: { id: chapter.chapter.id },
    update: {
      name: chapter.chapter.name_arabic,
      nameEn: chapter.chapter.name_simple,
    },
    create: {
      id: chapter.chapter.id,
      name: chapter.chapter.name_arabic,
      nameEn: chapter.chapter.name_simple,
    },
  });

  const translationMap = new Map<number, string>();
  translations.translations.forEach((translation, index) => {
    translationMap.set(index + 1, translation.text);
  });

  for (const verse of versesWords.verses) {
    const verseText = versesText.verses.find(
      (item) => item.verse_key === verse.verse_key
    );
    const translation = translationMap.get(verse.verse_number) ?? "";
    const transliteration = verse.words
      .map((word) => word.transliteration?.text)
      .filter(Boolean)
      .join(" ");

    await prisma.verse.upsert({
      where: { id: verse.id },
      update: {
        surahId,
        verseNumber: verse.verse_number,
        textArabic: verseText?.text_uthmani ?? "",
        translation,
        transliteration,
      },
      create: {
        id: verse.id,
        surahId,
        verseNumber: verse.verse_number,
        textArabic: verseText?.text_uthmani ?? "",
        translation,
        transliteration,
      },
    });

    for (const word of verse.words) {
      const audioUrl = word.audio_url
        ? `https://audio.qurancdn.com/${word.audio_url}`
        : null;

      await prisma.word.upsert({
        where: { id: word.id },
        update: {
          verseId: verse.id,
          position: word.position,
          textArabic: word.text,
          translation: word.translation?.text ?? "",
          transliteration: word.transliteration?.text ?? "",
          audioUrl,
        },
        create: {
          id: word.id,
          verseId: verse.id,
          position: word.position,
          textArabic: word.text,
          translation: word.translation?.text ?? "",
          transliteration: word.transliteration?.text ?? "",
          audioUrl,
        },
      });
    }
  }
}

async function main() {
  await seedSurah(1);
  await seedSurah(112);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
