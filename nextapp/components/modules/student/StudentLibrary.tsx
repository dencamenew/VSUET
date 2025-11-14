import { Button } from "@/components/ui/button";
import { SideFade } from "@/components/ui/particles/SideFade";
import { ILibraryBook, useLibraryDownload, useLibraryList } from "@/hooks/api/useLibrary"
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { BookText, Download } from "lucide-react";

function BookCard(
    {
        author,
        filename,
        title,
        topic,
        uploadDate,
    }: ILibraryBook
) {
    const { lang } = useLanguage();
    const t = translations[lang].library;
    const date = new Date(uploadDate);
    const download = useLibraryDownload();

    return (
        <div className="rounded-2xl bg-muted p-4 h-full flex flex-col justify-between">
            <div className="flex items-start gap-3 w-full">
                <BookText className="size-7" />
                <div className="flex flex-col flex-1">
                    <div className="w-full flex-1 flex justify-between gap-5">
                        <h3 className="font-semibold text-xl">
                            {title}
                        </h3>
                        <Button
                            onClick={() => download.mutate(filename)}

                            variant="default"
                            className="size-10"
                        >
                            <Download />
                        </Button>
                    </div>
                    <p className="text-muted-foreground">{topic}</p>
                </div>
            </div>
            <div className="text-lg pt-8 flex justify-between items-end w-full text-muted-foreground gap-4">
                <div className="flex pt-4 text-sm text-muted-foreground flex-col">
                    <p className="text-lg font-semibold">
                        {t.author}
                    </p>
                    {author}
                </div>
                <p className="font-semibold text-xs md:text-sm px-2 py-1 bg-muted-foreground/10 rounded-full">
                    {date.toLocaleDateString()}
                </p>
            </div>
        </div>
    )
}

export function StudentLibrary(
    {
        userPlaceholder
    }: {
        userPlaceholder: string
    }
) {
    const { lang } = useLanguage();
    const t = translations[lang].library;

    const list = useLibraryList();

    return (
        <div className="h-full bg-background text-foreground flex flex-col">
            <div className="flex-shrink-0 py-1 pt-12 px-6">
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <p className="text-muted-foreground md:hidden">{userPlaceholder}</p>
            </div>
            <div className="flex-1 min-h-0 relative overflow-hidden">
                <div className="absolute w-full pointer-events-none z-50 px-6">
                    <SideFade
                        width="100%"
                        height={24}
                        className="bg-gradient-to-b from-background to-transparent relative"
                    />
                </div>
                <div className="h-full px-6 py-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 scrollbar-xs">
                    {
                        list && list.map((book, index) => (
                            <BookCard
                                key={index}
                                {...book}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}