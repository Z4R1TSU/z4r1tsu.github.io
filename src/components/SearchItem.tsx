import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  slug: string;
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function SearchItem({ href, frontmatter, secHeading = true, slug }: Props) {
  const { title, pubDatetime, description } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slug },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="mb-6 list-none">
      <a
        href={href}
        className="inline-block font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 {...headerProps}>{title}</h2>
        ) : (
          <h3 {...headerProps}>{title}</h3>
        )}
      </a>
      <Datetime datetime={pubDatetime} />
      <p className="text-base">{description}</p>
    </li>
  );
}