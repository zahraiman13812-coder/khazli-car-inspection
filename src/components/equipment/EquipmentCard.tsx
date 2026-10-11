import Image from "next/image";

type EquipmentCardProps = {
  item: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    altText: string | null;
  };
};

export default function EquipmentCard({
  item,
}: EquipmentCardProps) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <Image
          src={
            item.imageUrl
          }
          alt={
            item.altText ||
            item.name
          }
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 hover:scale-[1.02]"
        />
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="text-lg font-black text-ink sm:text-xl">
          {
            item.name
          }
        </h2>

        <p className="mt-3 whitespace-pre-line text-sm leading-8 text-ink-secondary">
          {
            item.description
          }
        </p>
      </div>
    </article>
  );
}